
const schema_file = "https://abcd-j.github.io/schema/schema.json";
var editor
fetch(schema_file)
  .then((response) => {
    if (response.ok) {
      return response.json();
    } else {
      console.log(
        "WARNING: schema file could not be loaded"
      );
      return;
    }
  })
  .then((responseJson) => {
    obj = responseJson;
    console.log(obj)
    console.log(obj.properties)
    obj.format = "categories"
    obj.title = "ABCD-J Data Catalog Form"

    traverseSchema(obj, obj["$defs"], null)

    function makeTitle(schema, key) {
      if (!schema.hasOwnProperty("title")) {
        schema.title = key
      }
      schema.title = makePrettier(schema.title)
    }

    function makePrettier(input) {
      // Replace underscores and dashes with space
      output = input.replace(/_/g,' ');
      output = output.replace(/-/g,' ');
      // replace brackets
      result = output.replace('[',' (');
      result = result.replace(']',') ');
      // Capitalize first letter
      result = result.charAt(0).toUpperCase() + result.slice(1)
      return result
    }

    function traverseSchema(schema, defs, key_name) {
      // Assume schema has been resolved recursively
      // and all definitions are in #/$defs/
      
      // First make title for all types, except
      if(key_name != "items" && key_name != "$ref") {
        makeTitle(schema, key_name)
      }
      // Then execute tasks per type
      if (schema.hasOwnProperty("$ref")) {
        ref_key = schema["$ref"].replace('#/$defs/', '')
        traverseSchema(defs[ref_key], defs, "$ref")
      }
      else if (schema.type == "array") {
        schema.format = "table"
        traverseSchema(schema.items, defs, 'items')
      }
      else if (schema.type == "object") {
        for (const [key, value] of Object.entries(schema.properties)) {
          // Set correct display format for description fields
          if (key == "description" && value.type == "string") {
            value.format = "textarea"
          }
          // Set correct display format for date fields
          if ((key == "last_updated" || key.includes("date")) && value.type == "string") {
            value.format = "date"
          }
          // Set minitems on required arrays
          if (value.hasOwnProperty("type") &&
              value.type == "array" &&
              schema.hasOwnProperty("required") &&
              schema.required.includes(key)) {
            value.minItems = "1"
          }
          traverseSchema(schema.properties[key], defs, key)
        }
      }
      else {
        // pass
      }
    }

    return obj
  })  
  .then((obj) => {
    config = {
      ajax: false,
      schema: obj,
      theme: 'psyinf',
      iconlib: 'fontawesome5',
      object_layout: 'table',
      disable_edit_json: true,
      disable_properties: true,
      disable_collapse: true,
      remove_empty_properties: true,
      show_errors: 'interaction',
      show_opt_in: false,
      compact: false,
    }
    const form_element = document.getElementById("formeditor");
    editor = new JSONEditor(form_element, config);
    editor.on('ready',() => {
      // for some yet unknown reason, validation error alerts from a prior
      // validation procedure are still displayed when creating this new
      // editor (on page refresh), so here we find and remove them all.
      // Update after some investigation:
      // see: https://github.com/json-editor/json-editor/issues/856
      // see: https://github.com/json-editor/json-editor/issues/343
      // see: https://github.com/json-editor/json-editor/issues/1290
      var alertDivs = document.querySelectorAll('.alert,.alert-danger')
      alertDivs.forEach((item) => {
        item.remove();
      });
      // Then, we need to add a 'required' indicator to all tabs that 
      // have required children (TODO: this should go into theme JS)
      var requiredElements = document.querySelectorAll('label.required')
      requiredElements.forEach((item) => {
        tabpane = item.closest('.tab-pane')
        tab_id = tabpane.id
        href_val = "a[href='#" + tab_id +  "']"
        el = document.querySelector(href_val);
        el.classList.add('required-children')
      });
      

      // 


    });
    
    document.getElementById('submit').addEventListener('click',function() {
      // First validate the editor's current value against the schema
      const errors = editor.validate();
      if (errors.length) {
        // errors is an array of objects, each with a `path`, `property`, and `message` parameter
        // `property` is the schema keyword that triggered the validation error (e.g. "minLength")
        // `path` is a dot separated path into the JSON object (e.g. "root.path.to.field")
        console.log(errors);
        // TODO: add errors to some dropdown / popup / list somewhere on the page
      }
      else {
        var val = editor.getValue()
        var filename = 'abcdj_dataset'
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(val));
        var downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href",     dataStr);
        downloadAnchorNode.setAttribute("download", filename + ".json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
      }
    });
  })
  .catch((error) => {
    console.log("Config file error:");
    console.log(error);
  });