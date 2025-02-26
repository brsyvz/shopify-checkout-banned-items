(() => {

    const errorStyle = `
        position: absolute;
        top: 0;
        right: 0;
        font-size: 12px;
        font-weight: bold;
        color: #8B0000;
        text-transform: uppercase;
        margin: 0.2rem 1rem 0;
    `

    const rules = {
        first_name: {
            max_length_message: 'First name cannot exceed 20 characters.',
            max_length: 20,
        },
        last_name: {
            max_length_message: 'Last name cannot exceed 20 characters.',
            max_length: 20,
        },
        company: {
            max_length_message: 'Company cannot exceed 40 characters..',
            max_length: 40,
        },
        address1: {
            max_length_message: 'Address 1 cannot exceed 40 characters.',
            max_length: 40,
        },
        address2: {
            max_length_message: 'Address 2 cannot exceed 40 characters.',
            max_length: 40,
        },
        city: {
            max_length_message: 'City should contain up to 40 characters only.',
            max_length: 40,
        },
        phone: {
            max_length_message: 'Phone should contain up to 30 characters only.',
            max_length: 30,
        },
        zip: {
            message: 'The postal code is invalid'
        }
    }

    function ZipCodeValidation(country, zipCode) {
        var usValidation = new RegExp(/(^\d{5}$)|(^\d{5}-\d{4}$)/);
        var caValidation = new RegExp(/^[ABCEGHJ-NPRSTVXY][0-9][ABCEGHJ-NPRSTV-Z] [0-9][ABCEGHJ-NPRSTV-Z][0-9]$/);
        var isValid = false;
        switch (country) {
            case "United States":
                isValid = usValidation.test(zipCode);
                break;
            case "Canada":
                isValid = caValidation.test(zipCode);
                break;
        }
        return isValid;
    }

    document.addEventListener('DOMContentLoaded', () => {

        let issues = [];
        Object.keys(rules).forEach(keyName => {

            let rule = rules[keyName];
            let items = document.querySelectorAll(`[name="address[${keyName}]"]`);
            [...items].forEach(item => {
                // remove default field validation
                item.removeAttribute('size');
                item.addEventListener('input', () => {
                    let content = String(item.value);

                    let msgElement = item.parentNode.querySelector('small.error');
                    if (msgElement) {
                        msgElement.remove();
                    }

                    issues = issues.filter(i => i !== keyName);

                    if (keyName === 'zip') {

                        let country = item.closest('form').querySelector('[name="address[country]"]');
                        if (content.length) {
                            if (!ZipCodeValidation(country.value, content)) {
                                item.parentNode.insertAdjacentHTML(
                                    'beforeend',
                                    `<small style="${errorStyle}" class="error">${rule.message}</small>`
                                );
                                issues.push(keyName);
                            }
                        }

                    } else {

                        if (content.length > rule.max_length) {
                            item.parentNode.insertAdjacentHTML(
                                'beforeend',
                                `<small style="${errorStyle}" class="error">${rule.max_length_message}</small>`
                            );
                            issues.push(keyName);
                        }

                    }

                    if (issues.length) {
                        item.closest('form').querySelector('button').disabled = true;
                        item.closest('form').querySelector('button').classList.add('disabled');
                    } else {
                        item.closest('form').querySelector('button').disabled = false;
                        item.closest('form').querySelector('button').classList.remove('disabled');
                    }
                });
            });

        });

    });

})();