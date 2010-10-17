(function($){
	
	// extend the $.support function to test for native form attribute and type support
	// written by "lonesomeday" at http://stackoverflow.com/users/417562/lonesomeday
	// many thanks!
	if ( $.support.input === undefined ) { // make sure the .support function does not already support testing for this (a feeble attempt at future proofing this script?)
		(function(d){d.extend(d.support,function(){var c=document.createElement("input");return{inputtypes:function(){var a="search number range color tel url email date month week time datetime datetime-local".split(" "),b={};i=0;for(j=a.length;i<j;i++){c.setAttribute("type",a[i]);b[a[i]]=c.type!=="text"}return b}(),input:function(){var a="autocomplete autofocus list placeholder max min multiple pattern required step".split(" "),b={};i=0;for(j=a.length;i<j;i++)b[a[i]]=!!(a[i]in c);return b}()}}())})(jQuery);
	}
	
	// Let's Go!
	$.fn.extend({ 
		
		//pass the options variable to the function
		autoForm5: function(options) {
	
			$.fn.autoForm5.defaults = {
				
				// general plugin settings & defaults
				validateForm: true, 					// enable error checking to eliminate placeholder and false values to be submitted
				requiredFields: '', 					// manually allow for adding required fields here (comma separated)
				interimDataField: 'instructions', 		// the attribute name used to store interim text
				
				// the default classes used by the plugin
				classes : {
					form		: 'af5-activeform',		// added to the form that is the parent of the currenly focussed field
					fieldset	: 'af5-activefieldset',	// added to the fieldset that is the parent of the currently focussed field
					error		: 'af5-error', 			// added to fields that fail validation (on form submit and during live checking)
					required	: 'af5-required',		// added to fields that are required (on ready)
					passive		: 'af5-passive',			// added to fields that are not currently focussed (on ready)
					active		: 'af5-active',			// added to the currently focussed field
					interim		: 'af5-interim',			// added to a field that is displaying the data-instructions text (if any)
					filled		: 'af5-filled'			// added to fields that have a user entered value
				},
				
				pattern : {
					tel		: 	/(?!:\A|\s)(?!(\d{1,6}\s+\D)|((\d{1,2}\s+){2,2}))(((\+\d{1,3})|(\(\+\d{1,3}\)))\s*)?((\d{1,6})|(\(\d{1,6}\)))\/?(([ -.]?)\d{1,5}){1,5}((\s*(#|x|(ext))\.?\s*)\d{1,5})?(?!:(\Z|\w|\b\s))/,
					email	: 	/^(\w|\.|-)+?@(\w|-)+?\.\w{2,4}($|\.\w{2,4})$/,
					number	: 	/^\d+$/,
					url		: 	/(https?:\/\/)?(www\.)?([a-zA-Z0-9_%]*)\b\.[a-z]{2,4}(\.[a-z]{2})?((\/[a-zA-Z0-9_%]*)+)?(\.[a-z]*)?/,
					text	: 	/./
				}
			};
			
			var options =	 $.extend(true,$.fn.autoForm5.defaults, options);
			return this.each(function() {
			// should return a <form> element, not any child field directly!
				
				
				// map options to var o for shorter variable call
				var o = options;
				// create namespace to store values securely
				var AF5 = {};

				AF5.form = (this.nodeName == 'FORM'?$(this):$(this).closest('form')); // if someone does not properly point the script at the FORM element this will find the proper form but creates extra object (wasteful…)
				AF5.fieldsets = $('fieldset', AF5.form);
				AF5.inputs = $('input:not([type=submit])', AF5.form);
				AF5.submit = $('[type=submit]', AF5.form);
			
				AF5.fields = {
					number 		: $('input[type=number]', AF5.form),
					tel			: $('input[type=tel]', AF5.form),
					email		: $('input[type=email]', AF5.form),
					search		: $('input[type=search]', AF5.form),
					url			: $('input[type=url]', AF5.form),
					placeholder : $(':input[placeholder]', AF5.form),
					required	: $(':input[required=""],:input.required,'+o.requiredFields, AF5.form),
					autofocus	: $(':input[autofocus=""]', AF5.form),
					interim		: $(':input[data-'+o.interimDataField+']', AF5.form)
				};
				
				AF5.validation = {
					regex: {
						tel: 	o.pattern.tel,
						email: 	o.pattern.email,
						number: o.pattern.number,
						url: 	o.pattern.url,
						text: 	o.pattern.text
					},
					validate: function(value, type) {
						if (type == null) type = 'text';
						var reg = (this.regex[type]?this.regex[type]:this.regex['text']);
						// console.log('value: '+value+' type: '+type+' result :'+reg.test(value));
						return reg.test(value);
					}
				};
				
				// =======================================
				// = CHECK FOR data-[interim] ATTRIBUTE  =
				// =======================================
				function interim(ele, action) { // ele pass $(this) into it & action = boolean (true = print value)
					if (action) {
						return $(ele).attr('data-'+o.interimDataField); // print the actual data value
					} else {
						return ($(ele).attr('data-'+o.interimDataField) ? true : false ); // if attribute present return true
					}
				}

				// ======================================================
				// = ADD CLASSES TO FORMS & FIELDSETS & REQUIRED INPUTS =
				// ======================================================
				function classified() {
					// attach classes to forms & fieldsets
					AF5.inputs.each(function(index) { // cycle through all inputs
					  	var self = $(this);
						
						self.addClass(o.classes.passive); // add passive class to all fields
						
						self.bind('focus blur', function(e) {
							
							var closestForm = self.closest('form'), // cache the closest form, could use AF5.form for this but this way it will be safer should there be multiple forms on the page
								closestFieldset = self.closest('fieldset'); // cache the closest fieldset
							
						  	if (e.type == "focus") {
								// add class indicators
								closestFieldset.addClass(o.classes.fieldset);
								closestForm.addClass(o.classes.form);
								self.addClass(o.classes.active).removeClass(o.classes.passive);

							} else if (e.type = "blur") {
								// take them away…
								closestFieldset.removeClass(o.classes.fieldset);
								closestForm.removeClass(o.classes.form);
								self.removeClass(o.classes.active).addClass(o.classes.passive);
								
								// when leaving the field check the value and if filled by the user add the filled class
								if ( self.val() != self.attr('placeholder') && self.val() != "" && self.val() != interim(self,true) && self.val() != self.attr('data-error') ) {
									self.addClass(o.classes.filled); // add the class
									
									if (!$.support.input.email || !$.support.input.tel || !$.support.input.url || !$.support.input.number ) { // if not natively supported
										if ((AF5.validation.validate( self[0].value , self[0].getAttribute('type')))) { // validate
											self.removeClass(o.classes.error); // on success remove error class
										} else {
											self.addClass(o.classes.error); // on fail re-add error class
										}
									}
									
								} else {
									self.removeClass(o.classes.filled); // if field is left blank on blur remove filled class
								}
							}
						});
						
						// Add error checking while you type
						self.bind('keyup', function(e) {
						  	if (self.is('.'+o.classes.error) && e.type == "keyup" && (AF5.validation.validate( self[0].value , self[0].getAttribute('type')))) {
								self.removeClass(o.classes.error);
						 	}
						});
					
					});
					// attach required classes
					AF5.fields.required.each(function(i) {
						var self = $(this);
						self.addClass(o.classes.required);
					});
					
					// special handlers for the submit button
					AF5.submit.bind('focus blur', function(e) {
					var self = $(this),
						closestForm = self.closest('form'), // cache the closest form, could use AF5.form for this but this way it will be safer should there be multiple forms on the page
						closestFieldset = self.closest('fieldset'); // cache the closest fieldset
					
					  	if ( e.type == "focus" ) { 
					  		closestFieldset.addClass(o.classes.fieldset);
							closestForm.addClass(o.classes.form);
							self.addClass(o.classes.active)
					  	} else {
							closestFieldset.removeClass(o.classes.fieldset);
							closestForm.removeClass(o.classes.form);
							self.removeClass(o.classes.active)
						}
					});
				}
				classified(); // run classified()

				// =====================
				// = ADD ERROR CLASSES =
				// =====================
				function validate(fields) { // fields = failed elements
					$.each(fields, function(i, ele) {
					  	$(ele).addClass(o.classes.error); // add classes
					
						// if the field has a data-error attribute, set it as the value but ONLY AF5 the field has no user entered information
						if ($(ele).attr('data-error') && ele.value == "" || ele.value == interim(ele,true) || ele.value == $(ele).attr('placeholder')) {$(ele).val($(ele).attr('data-error'));}
						
						$(ele).bind('keyup blur change', function(e) { // add value monitoring for live validation feedback
							if ((AF5.validation.validate( ele.value , ele.getAttribute('type')))) {
								$(ele).removeClass(o.classes.error); // remove error class
							} else {
								$(ele).addClass(o.classes.error); // re-add error class
							};
							
						});
					});
				}
				// ========================================
				// = CHECK FOR REQUIRED ATTRIBUTE SUPPORT =
				// ========================================
				if ($.support.input.required) { // if required is natively supported
					$.each($(':input.required,'+o.requiredFields), function(i, ele) { // go through all required fields that do not use the "required" boolean attribute
					  	ele.setAttribute('required',true); // add the boolean attribute on alternative required marked fields so that the html5 spec can take a hold of them
					});
				} 
				

				// ========================
				// = PLACEHOLDER FALLBACK =
				// ========================
				if (!$.support.input.placeholder) { // if no native placeholder text is supported run the following

					AF5.fields.placeholder.each(function(i) {

						var self = $(this); // cache current ele
						
						if (self.val() == "") { // if the field is empty || there is no user input (from page reload or back button use)
						self.val(self.attr('placeholder')); // add placeholder text into the field
						}
						
						self.bind('focus blur keydown click', function(e) {
						  	if (e.type == "focus" && self.val() == self.attr('placeholder')) { // when focussed & placeholder is shown (stops it from clearing user entered info)

								if (interim(self)) { // if the iterim state is switched on
									self.val(interim(self,true)); // show interim text
								} else {
									self.val(''); // clear field
								}
								
							} else if (e.type == "blur") { // when blurred

								if ( self.val() == "" || self.val() == interim(self,true) || self.val() == self.attr('data-error')) {
									self.val(self.attr('placeholder'));
								}
								
							} else if (e.type == "keydown" && self.val() == interim(self,true) || self.val() == self.attr('data-error')) { // on keydown and if the interim text is visible
								self.val(''); // clear the field to make room for user input
							}
						
						});
					
					});
				} else {
					// in any case looks for interim data attribute to inject
					AF5.fields.interim.each(function(i) {
						var self = $(this);
						self.addClass(o.classes.passive);
						
						self.bind('focus blur keydown', function(e) {
						  	if (e.type == "focus" && interim(self) && self.val() == "") { // when focussed & placeholder is shown (stops it from clearing user entered info)
								self.val(interim(self,true)); // show interim text
							} else if (e.type=="blur" && self.val() == interim(self,true) || self.val() == self.attr('data-error')) {
								self.val('');
							} else if (e.type == "keydown" && self.val() == interim(self,true) || self.val() == self.attr('data-error')) { // on keydown and if the interim text is visible
								self.val(''); // clear the field to make room for user input
							}
						});
					});
				};
				
				// =============
				// = AUTOFOCUS =
				// =============
				if (!$.support.input.autofocus) { // if no native support
					AF5.fields.autofocus.first().focus(); // find all fields with autofocus attribute and focus the first one (just in case someone has the idea of adding multiple per form)
				};
				
				// ==============================
				// = FORM SUBMISSION VALIDATION =
				// ==============================
				AF5.form.submit(function(e) {

					if (!$.support.input.required) {
					
						var required = []; // create an empty array for the collection of failed but required elements
						$.each(AF5.fields.required, function(i, ele) { // cycle through all required fields
							$(ele).removeClass(o.classes.error); // make sure all error classes are taken off
						  	if ( ele.value == "" || ele.value == $(ele).attr('placeholder') || ele.value == interim(ele,true) || (! AF5.validation.validate( ele.value , ele.getAttribute('type') ) ) ) { // if the value of the field is blank, the same as the placeholder or the interim text then fail this field
								required.push(ele); // add failed field to the required array
							}
						});
						if ( required.length ) // if the required array has collected any fields
						{ 
							e.preventDefault(); // stop the form submission
							validate(required); // pass those fields onto the validation function
						}
					
					};
					
				});
			
			});
				
		}
	});
	
})(jQuery);