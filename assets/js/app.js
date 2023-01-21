// Classes

// event thing related to the Budget
class Budget {
	constructor(budget) {
		this.budget = budget;
	}
}

// event thing related to the UI
class UI {
	// insert budget to the document
	insertBudget(totalBudgetValue, leftBudgetValue) {
		totalBudget.textContent = this.convertNumbers(totalBudgetValue);
		leftBudget.textContent = this.convertNumbers(leftBudgetValue);
	}

	// insert expense to the document
	insertExpense(expenseName, expenseAmount) {
		const li = document.createElement("li");
		li.classList = "expense-list-item";
		li.innerHTML = `
           <span id="expense-name" >${expenseName}</span>  <span id="expense-amount" class="badage">${this.convertNumbers(
			expenseAmount
		)} تومان</span>  
        `;

		li.id = expenseList.children.length;
		expenseList.appendChild(li);
	}

	// print message
	printMessage(message, state) {
		if (state == "success") {
			Swal.fire({
				toast: true,
				title: message,
				icon: state,
				timerProgressBar: true,
				timer: 3000,
				showConfirmButton: false,
				position: "bottom-right",
			});
		} else if (state == "info") {
			Swal.fire({
				toast: true,
				title: message,
				icon: state,
				timerProgressBar: true,
				timer: 3000,
				showConfirmButton: false,
				position: "bottom-right",
			});
		} else {
			Swal.fire({
				toast: true,
				title: message,
				icon: "error",
				timerProgressBar: true,
				timer: 3000,
				showConfirmButton: false,
				position: "bottom-right",
			});
		}
	}

	// display and subtract left budget
	displayLeftBudget() {
		const expenses = ls.getExpenseFromLS();
		let total = ls.getTotalAndLeftBudgetFromLS();

		let sum = 0;
		for (const item of expenses) {
			sum = sum + Number(item[1]);
		}

		let budgetLeft = Number(total[0]) - sum;

		if (budgetLeft < 0) {
			return;
		}
		ls.addLeftBudgetToLS(budgetLeft);
		leftBudget.innerHTML = `${ui.convertNumbers(budgetLeft)}`;
	}

	// convert english number to persian numbers
	convertNumbers(number) {
		return Number(number).toLocaleString("fa");
	}

	// remove expense list item from ul
	deleteExpense(target) {
		const expenses = ls.getExpenseFromLS();

		let totalBudgetFromLS = localStorage.getItem("totalBudget");
		let leftBudgetFromLS = localStorage.getItem("leftBudget");

		expenses.forEach((expenseItem, index) => {
			if (index == Number(target.id)) {
				let leftBudget =
					Number(leftBudgetFromLS) + Number(expenseItem[1]);

				ls.addLeftBudgetToLS(leftBudget);
				ui.insertBudget(totalBudgetFromLS, leftBudget);
			}
		});

		expenses.splice(Number(target.id), 1);
		localStorage.setItem("expenses", JSON.stringify(expenses));
		target.remove();

		// remove expenses from LS when is empty
		if (localStorage.getItem("expenses") == "[]") {
			localStorage.removeItem("expenses");
		}
	}

	// edit expense
	editExpense(target) {
		const expenses = ls.getExpenseFromLS();

		expenses.forEach(async (expense, index) => {
			if (target.id == index) {
				const { value: formValues } = await Swal.fire({
					title: "ویرایش هزینه",
					html:
						`<input dir="rtl" id="swal-input1" class="swal2-input" value="${expense[0]}">` +
						`<input type="number" id="swal-input2" class="swal2-input" value="${expense[1]}">`,
					focusConfirm: false,
					confirmButtonText: "ویرایش",
					preConfirm: () => {
						return [
							document.getElementById("swal-input1").value,
							document.getElementById("swal-input2").value,
						];
					},
				});

				// validate fields
				if (formValues[1].includes("-")) {
					this.printMessage(
						"هزینه نمی‌‌تواند شامل اعداد منفی باشد!",
						"error"
					);
					return;
				} else {
					const expenseName = formValues[0];
					const expenseAmount = formValues[1];

					// set new Expenses to LS and Insert to the DOM
					target.querySelector(
						"#expense-name"
					).innerText = expenseName;
					target.querySelector(
						"#expense-amount"
					).innerText = `${this.convertNumbers(expenseAmount)} تومان`;

					expenses.splice(index, 1, [expenseName, expenseAmount]);
					localStorage.setItem("expenses", JSON.stringify(expenses));

					this.displayLeftBudget();
				}
			}
		});
	}
}

// every thing related to the LocalStorage
class LocalStorage {
	// add total budget to the LS
	addTotalBudgetToLS(totalBudget) {
		localStorage.setItem("totalBudget", totalBudget);
	}

	// add left budget to the LS
	addLeftBudgetToLS(leftBudget) {
		localStorage.setItem("leftBudget", leftBudget);
	}

	// display total and left budget from LS when DOMContentLoaded
	displayTotalAndLeftBudget() {
		const budgets = this.getTotalAndLeftBudgetFromLS();
		ui.insertBudget(budgets[0], budgets[1]);
	}

	// get total and left from the LS
	getTotalAndLeftBudgetFromLS() {
		let totalBudget;
		let leftBudget;

		let totalBudgetFromLS = localStorage.getItem("totalBudget");
		let letBudgetFromLS = localStorage.getItem("leftBudget");

		if (totalBudgetFromLS == null || letBudgetFromLS == null) {
			totalBudget = "";
			leftBudget = "";
		} else {
			totalBudget = totalBudgetFromLS;
			leftBudget = letBudgetFromLS;
		}

		return [totalBudget, leftBudget];
	}

	// add expense to the LS
	addExpenseToLS(expenseName, expenseAmount) {
		const expenses = this.getExpenseFromLS();

		expenses.push([expenseName, expenseAmount]);
		localStorage.setItem("expenses", JSON.stringify(expenses));
	}

	// display expenses from LS when DOMContentLoaded
	displayExpenses() {
		const expenses = this.getExpenseFromLS();
		expenses.map(function (expense) {
			ui.insertExpense(expense[0], expense[1]);
		});
	}

	// get expense from LS
	getExpenseFromLS() {
		let expenses;
		let expensesFromLS = localStorage.getItem("expenses");

		if (expensesFromLS == null) {
			expenses = [];
		} else {
			expenses = JSON.parse(expensesFromLS);
		}

		return expenses;
	}
}

// Variables
let budget;
const totalBudget = document.querySelector("#total-budget");
const leftBudget = document.querySelector("#left-budget");
const expenseList = document.querySelector("#box-left ul");
const resetBtn = document.querySelector("button[type='reset']");
const contextElement = document.getElementById("context-menu");
const deleteContextMenuBtn = contextElement.querySelector(
	"#context-menu-delete"
);

const editContextMenuBtn = contextElement.querySelector("#context-menu-edit");
let target;

const form = document.forms[0];
const expenseAmount = document.querySelector("#expense-amount");
let ui = new UI();
let ls = new LocalStorage();

// EventListeners
eventListeners();
function eventListeners() {
	document.addEventListener("DOMContentLoaded", async function (e) {
		let totalBudgetFromLS = localStorage.getItem("totalBudget");
		let leftBudgetFromLS = localStorage.getItem("leftBudget");

		if (totalBudgetFromLS && leftBudgetFromLS) {
			ls.displayTotalAndLeftBudget();
			ls.displayExpenses();
		} else {
			const { value: userBudget } = await Swal.fire({
				title: "لطفا بودجه هفته خود را وارد کنید",
				input: "number",
				confirmButtonText: "تایید",
			});

			// validate user budget input
			if (
				userBudget === "" ||
				userBudget === "0" ||
				userBudget.includes("-	")
			) {
				window.location.reload();
			} else {
				budget = new Budget(userBudget);

				// insertBudget to document
				ui.insertBudget(budget.budget, budget.budget);

				// add total budget to the LocalStorage
				ls.addTotalBudgetToLS(budget.budget);

				// add left budget to the LocalStorage
				ls.addLeftBudgetToLS(budget.budget);

				// display total and left Budget
				ls.displayTotalAndLeftBudget();
			}
		}
	});

	// form submit
	form.addEventListener("submit", function (e) {
		e.preventDefault();

		const expenseName = document.querySelector("#expense-name").value;
		const expenseAmount = document.querySelector("#expense-amount").value;

		const leftBudgetFromLS = localStorage.getItem("leftBudget");

		// vaildate fields
		if (
			expenseName == "" ||
			expenseAmount == "" ||
			expenseAmount == 0 ||
			expenseAmount.includes("-")
		) {
			ui.printMessage("لطفا مقادیر را به درستی وارد کنید!", "error");
		} else {
			if (Number(leftBudgetFromLS) < Number(expenseAmount)) {
				// display and subtract left budget
				ui.displayLeftBudget();

				ui.printMessage(
					"هزینه وارد شده از بودجه باقی‌مانده بیشتر است!",
					"info"
				);

				return;
			} else {
				// insert expense to the document
				ui.insertExpense(expenseName, expenseAmount);
				ui.printMessage("عملیات با موفقیت انجام شد!", "success");

				// add expense to the LS
				ls.addExpenseToLS(expenseName, expenseAmount);

				// display and subtract left budget
				ui.displayLeftBudget();

				// reset form then submit
				this.reset();
			}
		}
	});

	// reset button
	resetBtn.addEventListener("click", function (e) {
		const swalWithBootstrapButtons = Swal.mixin({
			customClass: {
				confirmButton: "btn btn-success",
				cancelButton: "btn btn-danger",
			},
			buttonsStyling: false,
		});

		swalWithBootstrapButtons
			.fire({
				title: "آیا از این کار مطمئنید‌؟",
				text: "با این کار کل بودجه و هزینه های شما پاک خواهد شد!",
				icon: "warning",
				showCancelButton: true,
				confirmButtonText: "بله، مطمئنم!",
				cancelButtonText: "نه، اشتباه کردم!",
				reverseButtons: true,
			})
			.then((result) => {
				if (result.value) {
					swalWithBootstrapButtons.fire(
						"برنامه ریست شد!",
						"تمامی هزینه ها پاک شدند.",
						"success"
					);

					form.reset();
					localStorage.clear();
					expenseList.innerHTML = ``;
					setTimeout(() => {
						window.location.reload();
					}, 1300);
				} else if (result.dismiss === Swal.DismissReason.cancel) {
					swalWithBootstrapButtons.fire(
						"عملیات شکست خورد!",
						"تبریک، مشکلی پیش نیامد :)",
						"error"
					);
				}
			});
	});

	// customize context menu expense list item
	window.addEventListener("contextmenu", function (e) {
		// disable right click meny default browser
		e.preventDefault();

		if (e.target.classList.contains("expense-list-item")) {
			contextElement.style.top = e.clientY + "px";
			contextElement.style.left = e.clientX + "px";

			contextElement.classList.add("active");
			target = e.target;
		}
	});

	window.addEventListener("click", function (e) {
		contextElement.classList.remove("active");
	});

	editContextMenuBtn.addEventListener("click", function (e) {
		ui.editExpense(target);
	});

	deleteContextMenuBtn.addEventListener("click", function (e) {
		ui.deleteExpense(target);
	});
}
