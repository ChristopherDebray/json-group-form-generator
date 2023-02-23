# JsonGroupFormGenerator

**WARNING : This project is not finished yet**

## Purpose

The purpose of this package is to have a class allowing to generate a form with it's inputs, a listing (with pagination) of every targeted object, but this is not the main purpose of this package.

The main purpose of the package is that all of the data set in the form will be dynamic for every item in it's object list.
In the browser, if I select the user_1 from the object list and change it's password and then select user_2, the value set in the form for the user_1 will be saved in the object list json, the same goes if we change pages.

The purpose is that we will save one json, containing all our data in one time and allowing us to send all this data at once.

### Case of usage

For exemple, imagine that you have to create a calendar, each day there is a question and a set of answers.

The thing is that you may want to create (or update) all (or a part) of your question, answers for each days.

Instead of having to send all of them one by one to your api in order to save them here you can change all of these data and send them all at once !

<!-- ## Exemple -->



## Installation

Use the package manager npm to install JsonGroupFormGenerator

```bash
npm install object_infos_form_generator
```

## Usage

```javascript
import JsonGroupFormGenerator

let parameters = {/* The configuration object, described in the configuration section */};

const objectInfosForm = new JsonGroupFormGenerator(parameters)
objectInfosForm.run()
```

## Configuration

When you use this package you must create an object which will serve as a config file.

This object will contains 2 objects and 1 array (with exemples) :
- **objectList** (an array with the list of objects)
- **fields** (the inputs that must be generated in your form)
- **config** (the configurations)

***objectList***
```javascript 
[
    {
        "lastname": "Doe",
        "firstname": "John"
    },
    {
        "lastname": "One",
        "firstname": "Some"
    },
]
```

***fields***
```javascript
{
    /*
     * Every input is an object defined by a key defining it's input id.
     * They MUST contain at least a 'label' to define the label displayed, a 'type' to define the input type
     * In case of an input having specific 'type' (checkbox, radio, select) the input object MUST contain 'group' to define under which name the values are grouped.
     * It MUST also contain 'values' to define every values linked to the inputs, the key being the label, the value being the value.
     */
    'lastname': {
        'label': 'Nom',
        'type': 'text',
    },
    'roles': {
        'label': 'Rôle',
        'type': 'radio',
        'group': 'roles',
        'values': {
            'Admin': 'ROLE_ADMIN',
            'Manager': 'ROLE_MANAGER',
            'Utilisateur': 'ROLE_USER'
        },
    },
    'likes': {
        'label': 'Cette personne aimes',
        'type': 'checkbox',
        'group': 'likes',
        'values': {
            'Manger': 'eat',
            'Lire': 'read'
        }
    },
    'job': {
        'label': 'Profession',
        'type': 'select',
        'group': 'job',
        'values': {
            'Développeur web': 'web developer',
            'Boulanger': 'baker'
        }
    }
}
```

***config***
```javascript
{
    // --MANDATORY-- MUST be unique, every item in the objectList must have this field  (and this field must not be empty) : <string>
    'identifierKey': 'email', 
    // --MANDATORY-- Define which key in the objectList is used as identifier to display the selection blocks
    // If there is a + it will concatenate both of the fields (exemple: 'firstname+lastname') : <string>
    'displayedObjectText': 'firstname+lastname',
    // --MANDATORY-- Define if the pagination is active : <bool>
    'pagination' : true,
    // Define the max number of items in a page : <int>
    'itemsLimit': 3,
    // Define the id of the container where the inputs are placed (by default it will be in '') : <string|null>
    'inputsContainer': null,
    // Define the id of the container where the objects are listed (by default it will be in '') : <string|null>
    'objectsContainer': null,
    // Define the id of the container where the pagination is placed (by default it will be in '') : <string|null>
    'paginationContainer': null,
    // Define the id of the submit button (by default it will be in '') : <string|null>
    'submitButtonId': null,
    // Define which type of pagination is used (This functionnality will be added in the future, allowing to change the pagination with page number instead of select menu) : <string|null>
    'paginationType': null
}
```

## License

[MIT](https://choosealicense.com/licenses/mit/)