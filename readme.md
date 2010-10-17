# autoForm5 : A non judgmental HTML5 form plugin for jQuery.

*First commit of this little project.*

This plugin adds some basic html5 form element support to existing web browser including IE6,7,8, Firefox, Google Chrome for Mac, Safari 5 (enhancements).

## Supported HTML5 form input attributes are:

    * placeholder
    * required
    * autofocus

## Supported HTML5 form input types are:

    * tel
    * number
    * email
    * url
 
In addition to adding support for the above things the form is validated on submit, with error classes being applied to failed input elements and live error checking on required fields.

Finally all variables of the plugin are easily definable by passing them into the function as an object:

**Defaults**:

    $('form').autoForm5({
        // basic settings and their defaults are
        validateForm: true,
        requiredFields: '',
        interimDataField: 'instructions',
        
        // classes and their defaults
        classes : {
            form		: 'af5-activeform',	
            fieldset	: 'af5-activefieldset',
            error		: 'af5-error', 		
            required	: 'af5-required',	
            passive		: 'af5-passive',	
            active		: 'af5-active',		
            interim		: 'af5-interim',	
            filled		: 'af5-filled'		
        },
        
        // all regex pattern for the validation are also accessible
        pattern : {
            tel		: 	/(?!:\A|\s)(?!(\d{1,6}\s+\D)|((\d{1,2}\s+){2,2}))(((\+\d{1,3})|(\(\+\d{1,3}\)))\s*)?((\d{1,6})|(\(\d{1,6}\)))\/?(([ -.]?)\d{1,5}){1,5}((\s*(#|x|(ext))\.?\s*)\d{1,5})?(?!:(\Z|\w|\b\s))/,
        	email	: 	/^(\w|\.|-)+?@(\w|-)+?\.\w{2,4}($|\.\w{2,4})$/,
        	number	: 	/^\d+$/,
        	url		: 	/(https?:\/\/)?(www\.)?([a-zA-Z0-9_%]*)\b\.[a-z]{2,4}(\.[a-z]{2})?((\/[a-zA-Z0-9_%]*)+)?(\.[a-z]*)?/,
        	text	: 	/./
        }
    });

**Example**:

The following will change the 'af5-active' class to 'active' and the 'af5-passive' class to 'inactive'.
Also we're adding an input field with an ID of #someinput to the required fields array for validation purposes.
By default all fields with the HTML5 required attribute or with a class of 'required' are added to this stack, if for whatever reason you are opposed to adding the attribute or class to the element directly you can specify them here as a comma separated list.

    $('form').autoForm5({
        requiredFields: '#someinput',
        classes : {
            active : 'active',
            passive: 'inactive'
        }
    });