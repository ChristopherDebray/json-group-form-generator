class JsonGroupFormGenerator {
    constructor(parameters) {
        this.formId = parameters.config.form ?? 'js-object-infos-form';
        this.inputsContainerId = parameters.config.inputsContainer ?? 'js-object-infos-form__inputsContainer';
        this.objectsContainerId = parameters.config.objectsContainer ?? 'js-object-infos-form__objectsContainer';
        this.submitButtonId = parameters.config.submitButton ?? 'js-object-infos-form__submit';
        this.paginationContainerId = parameters.config.paginationContainer ?? 'js-object-infos-form__paginationContainer';

        this.objectList = parameters.objectList;
        this.fields = parameters.fields;
        this.config = parameters.config;
        this.offset = 0;
        this.form = document.getElementById(this.formId);
        this.inputsContainer = document.getElementById(this.inputsContainerId);
        this.objectsContainer = document.getElementById(this.objectsContainerId);
        this.submitButton = document.getElementById(this.submitButtonId);
        this.paginationContainer = document.getElementById(this.paginationContainerId);
        this.fieldsElements = [];
    }

    run() {
        this._inplementObjectList();
        this._inplementFieldsInputs();
        this._setupFormSubmit();

        if(this.config.pagination) {
            this._createPaginationList();
        }
    }

    // OBJECT LIST
    _inplementObjectList() {
        if (this.config.displayedObjectText) {
            this.displayedObjectTextArray = this.config.displayedObjectText.split('+');
        }

        if (this.config.pagination) {
            this.paginationScope = this.offset + this.config.itemsLimit;
            for (let index = this.offset; index < this.paginationScope; index++) {
                if (!this.objectList[index]) {
                    return;
                }
                this._generateObjectItems(this.objectList[index], index)
            }
        } else {
            this.objectList.forEach((object, index) => {
                this._generateObjectItems(object, index)
            });
        }
    }

    _generateObjectItems(object, loopIndex) {
        let objectIdentifierString = this._createObjectIdentifierString(object);
        // FIX class undefined
        let isActive; '';
        if (this.offset === loopIndex) {
            isActive = 'active';
            this._setSelectedObject(object[this.config.identifierKey]);
        }

        this.objectsContainer.insertAdjacentHTML('beforeend', `<li class='${isActive}' data-id='${object[this.config.identifierKey]}'>
            ${objectIdentifierString}
        </li>`);
        this._setObjectEventListener(object[this.config.identifierKey]);
    }

    _createObjectIdentifierString (object) {
        let objectIdentifierString = '';

        if (this.displayedObjectTextArray) {
            this.displayedObjectTextArray.forEach((identifier) => {
                objectIdentifierString += ' '+object[identifier];
            })
        } else {
            objectIdentifierString = object[Object.keys(object)[0]];
        }

        return objectIdentifierString;
    }

    // FIELDS
    _inplementFieldsInputs() {
        for (const field in this.fields) {
            this._generateFieldsInputs(field, this.fields[field])
        }
        this._setFieldsValueWithSelectedObjectJson();
    }

    _generateFieldsInputs(key, field) {
        this.inputsContainer.insertAdjacentHTML('beforeend', this._createFieldInputElement(key, field));

        if (field.type === 'radio') {
            this.fieldsElements.push(document.getElementsByName(field.group))
        } else if (field.type === 'checkbox') {
            this.fieldsElements.push(document.querySelectorAll(`[data-group=${field.group}]`))
        } else {
            this.fieldsElements.push(document.getElementById(key))
        }
    }

    _createFieldInputElement(key, field) {
        let elementString = '<div>';
        if (field.type === 'radio') {
            elementString += `<fieldset><legend>${field.label}</legend>`;
            Object.entries(field.values).forEach(([label, value]) => {
                elementString += `<label for="${value}">${label}</label>
                <input id="${value}" type="${field.type}" name="${field.group}" value="${value}" ${this._generateInputRestrictions(field)}>`
            });
            elementString += '</fieldset>'
        } else if (field.type === 'checkbox') {
            elementString += `<fieldset><legend>${field.label}</legend>`;
            Object.entries(field.values).forEach(([label, value]) => {
                elementString += `<label for="${value}">${label}</label>
                <input id="${value}" type="${field.type}" name="${value}" data-group="${field.group}" value="${value}" ${this._generateInputRestrictions(field)}>`
            });
            elementString += '</fieldset>'
        } else if (field.type === 'select') {
            elementString += `<label for="${field.group}">${field.label}</label>
            <select name="${field.group}" id="${field.group}" ${this._generateInputRestrictions(field)}>
            <option value=""></option>`;
            Object.entries(field.values).forEach(([label, value]) => {
                elementString += `<label for="${value}">${label}</label>
                <option value="${value}">${label}</option>`
            });
            elementString += '</select>'
        } else {
            elementString += `<label for="${key}">${field.label}</label>
            <input id="${key}" type="${field.type}" ${this._generateInputRestrictions(field)}>`
        }

        return elementString + `</div>`
    }

    _generateInputRestrictions(field) {
        if(!field.restrictions) {
            return;
        }

        let restrictionString = '';
        Object.entries(field.restrictions).forEach(([restriction, value]) => {
            restrictionString += ` ${restriction}="${value}"`
        })
        return restrictionString;
    }

    _setFieldsValueWithSelectedObjectJson() {
        this.fieldsElements.forEach(element => {
            let elementArray = Object.values(element);

            const elementType = elementArray[0]?.getAttribute('type');
            if (elementType === 'radio') {
                const selectedObjectValue = this.selectedObject[elementArray[0].name];
                for (const radio of element) {
                    if (selectedObjectValue == radio.value) {
                        radio.checked = true;
                    } else {
                        radio.checked = false;
                    }
                }
            } else if (elementType === 'checkbox') {
                const selectedObjectValue = this.selectedObject[elementArray[0].dataset.group];
                let isSelectedObjectValueEmpty = (!selectedObjectValue || !selectedObjectValue.length)

                for (const checkbox of element) {
                    if (!isSelectedObjectValueEmpty && selectedObjectValue.includes(checkbox.value)) {
                        checkbox.checked = true;
                    } else {
                        checkbox.checked = false;
                    }
                }
            } else {
                element.value = this.selectedObject[element.id] ?? '';
            }
        });
    }

    // Object json modification
    _setSelectedObject (identifier) {
        const found = this.objectList.findIndex(object => object[this.config.identifierKey] == identifier);
        this.selectedObject = this.objectList[found];
        this.selectedObjectIndex = found;

        this._setFieldsValueWithSelectedObjectJson();
    }

    _setSelectedObjectJson () {
        this.fieldsElements.forEach(element => {
            const elementType = element[0]?.type;
            if (elementType === 'radio') {
                for (const radio of element) {
                    this.selectedObject[radio.name] = radio.checked ? radio.value : null;
                    if (radio.checked) {
                        break;
                    }
                }
            } else if (elementType === 'checkbox') {
                this.selectedObject[element[0].dataset.group] = [];
                for (const checkbox of element) {
                    if (checkbox.checked) {
                        this.selectedObject[element[0].dataset.group].push(checkbox.value)
                    }
                }
            } else {
                this.selectedObject[element.id] = element.value
            }
        });
    }

    // Object element click event
    _setObjectEventListener (identifier) {
        let objectElementQuery = `[data-id='${identifier}']`;
        const objectElement = document.querySelector(objectElementQuery);

        objectElement.addEventListener('click', this._objectElementClickHandler.bind(this))
    }

    _objectElementClickHandler(element) {
        let previousActiveElementQuery = `#${this.objectsContainerId} .active`;
        const previousActiveElement = document.querySelector(previousActiveElementQuery);
        const clickedElement = element.target;
        
        previousActiveElement.classList.remove('active');
        clickedElement.classList.add('active')
        this._setSelectedObjectJson();
        this._setSelectedObject(clickedElement.dataset.id)
    }

    // PAGINATION
    _createPaginationList() {
        let numberOfPages = Math.ceil(this.objectList.length/this.config.itemsLimit);
        if (numberOfPages === 1) {
            return;
        }

        if (this.config.paginationType === 'block') {
            this._createPaginationListButtons(numberOfPages);
        } else {
            this._createPaginationListSelect(numberOfPages);
        }
    }

    // PAGINATION -- block
    _createPaginationListButtons(numberOfPages) {
        for(let index = 1; index <= numberOfPages; index++) {
            this._createPaginationListButtonsItem(index);
        }
    }

    _createPaginationListButtonsItem(pageNumber) {
        let paginationItem =document.createElement("div");
        paginationItem.setAttribute("id", `js-pagination-${pageNumber}`);
        paginationItem.textContent = pageNumber;

        paginationItem.addEventListener('click', this._changePageHandler.bind(this))
        this.paginationContainer.appendChild(paginationItem);
    }

    // PAGINATION -- select
    _createPaginationListSelect(numberOfPages) {
        let paginationListString = '<select id="js-pagination-select">';
        for(let index = 1; index <= numberOfPages; index++) {
            paginationListString += `<option>${index}</option>`;
        }
        paginationListString += '</select>';
        this.paginationContainer.insertAdjacentHTML('beforeend', paginationListString);

        document.getElementById('js-pagination-select').addEventListener('change', this._changePageHandler.bind(this))
    }

    // PAGINATION Handler
    _changePageHandler(paginationItem) {
        this._setSelectedObjectJson();
        this.objectsContainer.innerHTML = null;
        this.offset = this.config.paginationType === 'block' ? (paginationItem.target.textContent - 1) * this.config.itemsLimit : (paginationItem.target.value - 1) * this.config.itemsLimit;
        this._inplementObjectList();
        this._setFieldsValueWithSelectedObjectJson();
    }

    // SUBMIT
    _setupFormSubmit () {
        const submitHandler = function (e) {
            e.preventDefault();
            this._setSelectedObjectJson();
            return this.objectList;
        }
        this.form.onsubmit = submitHandler.bind(this);
    }
}

module.exports = JsonGroupFormGenerator;