const form = document.getElementById('employeeForm');
const tableBody = document.getElementById('employeeTableBody');
const formError = document.getElementById('formError');
const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const mobileInput = document.getElementById('mobileNumber');

let editingEmployeeId = null;

function validateForm(data) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!data.employeeName || !data.email || !data.mobileNumber || !data.department || !data.salary) {
    return 'All fields are mandatory.';
  }

  if (!emailRegex.test(data.email)) {
    return 'Email should be in valid format.';
  }

  if (!/^\d{10}$/.test(data.mobileNumber)) {
    return 'Mobile number must be exactly 10 digits.';
  }

  if (Number(data.salary) <= 0) {
    return 'Salary must be a valid positive number.';
  }

  return '';
}

function getFormData() {
  return {
    employeeName: document.getElementById('employeeName').value.trim(),
    email: document.getElementById('email').value.trim(),
    mobileNumber: document.getElementById('mobileNumber').value.trim(),
    department: document.getElementById('department').value.trim(),
    salary: document.getElementById('salary').value
  };
}

function resetFormState() {
  editingEmployeeId = null;
  submitBtn.textContent = 'Add Employee';
  cancelEditBtn.classList.add('hidden');
  form.reset();
  formError.textContent = '';
}

mobileInput.addEventListener('input', () => {
  mobileInput.value = mobileInput.value.replace(/\D/g, '').slice(0, 10);
});

function startEdit(employee) {
  editingEmployeeId = employee.id;
  document.getElementById('employeeName').value = employee.employeeName;
  document.getElementById('email').value = employee.email;
  document.getElementById('mobileNumber').value = employee.mobileNumber;
  document.getElementById('department').value = employee.department;
  document.getElementById('salary').value = employee.salary;

  submitBtn.textContent = 'Update Employee';
  cancelEditBtn.classList.remove('hidden');
}

async function fetchEmployees() {
  const response = await fetch('/api/employees');
  if (!response.ok) {
    throw new Error('Failed to fetch employees.');
  }

  const employees = await response.json();
  renderEmployees(employees);
}

function renderEmployees(employees) {
  tableBody.innerHTML = '';

  if (!employees.length) {
    tableBody.innerHTML = '<tr><td colspan="6">No employee records found.</td></tr>';
    return;
  }

  employees.forEach((employee) => {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${employee.employeeName}</td>
      <td>${employee.email}</td>
      <td>${employee.mobileNumber}</td>
      <td>${employee.department}</td>
      <td>${employee.salary}</td>
      <td>
        <button type="button" data-action="edit" data-id="${employee.id}">Edit</button>
        <button type="button" data-action="delete" data-id="${employee.id}">Delete</button>
      </td>
    `;

    tableBody.appendChild(row);
  });
}

async function addEmployee(data) {
  const response = await fetch('/api/employees', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    throw new Error(errorPayload.message || 'Failed to add employee.');
  }
}

async function updateEmployee(id, data) {
  const response = await fetch(`/api/employees/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    throw new Error(errorPayload.message || 'Failed to update employee.');
  }
}

async function deleteEmployee(id) {
  const response = await fetch(`/api/employees/${id}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    throw new Error(errorPayload.message || 'Failed to delete employee.');
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  formError.textContent = '';

  const data = getFormData();
  const validationError = validateForm(data);

  if (validationError) {
    formError.textContent = validationError;
    return;
  }

  try {
    if (editingEmployeeId) {
      await updateEmployee(editingEmployeeId, data);
    } else {
      await addEmployee(data);
    }

    resetFormState();
    await fetchEmployees();
  } catch (error) {
    formError.textContent = error.message || 'Something went wrong.';
  }
});

cancelEditBtn.addEventListener('click', () => {
  resetFormState();
});

tableBody.addEventListener('click', async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) {
    return;
  }

  const id = target.dataset.id;
  const action = target.dataset.action;

  if (!id || !action) {
    return;
  }

  try {
    if (action === 'delete') {
      await deleteEmployee(id);
      await fetchEmployees();
      if (editingEmployeeId === id) {
        resetFormState();
      }
      return;
    }

    if (action === 'edit') {
      const row = target.closest('tr');
      if (!row) {
        return;
      }

      const employee = {
        id,
        employeeName: row.children[0].textContent || '',
        email: row.children[1].textContent || '',
        mobileNumber: row.children[2].textContent || '',
        department: row.children[3].textContent || '',
        salary: row.children[4].textContent || ''
      };

      startEdit(employee);
    }
  } catch (error) {
    formError.textContent = error.message || 'Action failed.';
  }
});

fetchEmployees().catch((error) => {
  formError.textContent = error.message || 'Could not load records.';
});
