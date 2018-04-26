


// budgetController
//
//This IFFE allows the variables it contains to exist in their own scope that cannot be accessed from the outside
var budgetController = (function() {
    
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }        
    };
    
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }
    
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };
    
    var totalExpenses = 0;
    
    var data = {
        
        allItems: {
            exp: [],
            inc: []
        },
        
        totals: {
            exp: 0,
            inc: 0
        },
        
        budget: 0,
        percentage: -1
    };
    
    return {
        addItem: function(type, desc, val) {
            
            var newItem, ID;
            
            // create new ID
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            // create new item based on 'inc' or 'exp' type
            if(type === 'exp') {
                newItem = new Expense(ID, desc, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, desc, val)
            }
            
            // push it into the data structure
            data.allItems[type].push(newItem);
            
            // return the new item
            return newItem;
        }, 
        
        deleteItem: function(type, ID) {
                      
            var ids, index;
            
            ids = data.allItems[type].map(function(current){
                return current.id;
            });
            
            index = ids.indexOf(ID);
            
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
            
        },
        
        calculateBudget: function() {
          
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            
            // calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
               data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100); 
            } else {
                data.percentage = -1;
            }
            
        },
        
        calculatePercentages: function() {
            
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            });            
        },
        
        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();    
            });
            return allPerc;
        },
        
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        
        testing: function() {
            console.log(data);
        }
    };
    
})();

// UIController
var UIController = (function() {
    
    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
    var formatNumber = function(num, type) {
            
        /*
            + or - before number
            exactly 2 decimal points
            comma separating the thousands

            2310.4567   --> + 2,310.46
            2000        --> 2,000.00
        */

        var numSplit, int, dec, type; 

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };
    
    nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };
            
    return {
        
        // getInput returns the three inputs from our UI input
        getInput: function() {
            return {
                // will be either inc (income) or exp (expense)
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        }, 
        
        addListItem: function(obj, type) {
          
            var html, newHtml, element;
            
            // create HTML string with placeholder tags
            if(type === 'inc'){
                
                // this is where the string will be inserted below
                element = DOMStrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                
                // this is where the string will be inserted below
                element = DOMStrings.expensesContainer;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
                
            // replace the placeholder tags with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value));
            
            // insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
        },
        
        deleteListItem: function(selectorID) {
            
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el); 
        },
        
        clearFields: function() {
          
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMStrings.inputDescription + ", " + DOMStrings.inputValue);
            
            // This is sweet. Calls the Array slice method with a list as the 'this' variable, and returns us an array. Essentially converts a map to an array    
            fieldsArr = Array.prototype.slice.call(fields);
            
            // forEach has access to the current element, the index, and the whole array
            fieldsArr.forEach(function(current, index, array) {
                current.value = '';
            });
            
        },
        
        displayBudget: function(obj) {
            
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if(obj.percentage > 0 ) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + "%";
            } else {  
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },
        
        displayPercentages: function(percentages) {
          
            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);
            
            nodeListForEach(fields, function(current, index){
                if (percentages[index] > 0 ) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
            
        },
        
        displayMonth: function() {
            var now, months, year, month;
            
            now = new Date();
            
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        
        changedType: function() {
            
            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.inputDescription + ',' +
                DOMStrings.inputValue);
            
            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
                
            });
            
            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
            
        },
        
        getDOMStrings: function() {
            return DOMStrings;
        }
    };
    
})();

// controller is the global app controller. This is where we want to decide what happens upon each event and delegate this to the other controllers. We define methods in the other controllers (when necessary) and then call them in this controller.
var controller = (function(budgetCtrl, UICtrl) {
    
    // setupEventListeners sets up the event listeners on the UI
    var setupEventListeners = function() {
        var DOMStrings = UICtrl.getDOMStrings();
        
        document.querySelector(DOMStrings.inputBtn).addEventListener('click', ctrlAddItem);
    
        document.addEventListener('keypress', function(event) {
            // we use which here as a backup for older browsers
            // that don't have the keycode property
            if(event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        
        document.querySelector(DOMStrings.container).addEventListener('click', ctrlDeleteItem);
        
        document.querySelector(DOMStrings.inputType).addEventListener('change', UICtrl.changedType);
    };
    
    var updateBudget = function() {
        
        // calculate the budget
        budgetCtrl.calculateBudget();
        
        // return the budget 
        var budget = budgetCtrl.getBudget();
            
        // display the budget
        UICtrl.displayBudget(budget);
        
    };
    
    var updatePercentages = function() {
    
        // calculate the percentages
        budgetCtrl.calculatePercentages();
        
        // read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        
        // update the user interface with the new percentages
        UICtrl.displayPercentages(percentages);
        
    };
    
    var ctrlAddItem = function() {
        
        var input, newItem;
        
        // GET THE FIELD INPUT DATA
        input = UICtrl.getInput();
           
        if(input.description !== '' && !isNaN(input.value) && input.value > 0) {
            
            // add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // add the new item to the UI
            UIController.addListItem(newItem, input.type);

            // clear the fields 
            UICtrl.clearFields();

            // calculate and update budget
            updateBudget();
            
            // calculate and update the percentages
            updatePercentages();
        }
    };
    
    var ctrlDeleteItem = function(event) {
      
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID) { 
        
            // id format: income-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            // delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);
            
            // delete the item from the user interface
            UICtrl.deleteListItem(itemID);
            
            // update and show the new budget
            updateBudget();     
            
            // calculate and update the percentages
            updatePercentages();
        }
    };
    
    return {
        // init sets up our application for execution
        init: function() {
            console.log('Application has started.');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };
      
})(budgetController, UIController);


controller.init();












