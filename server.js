const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs/promises');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'employees.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

async function readEmployees() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writeEmployees(employees) {
  await fs.writeFile(DATA_FILE, JSON.stringify(employees, null, 2));
}

function validateEmployee(payload) {
  const errors = [];
  const employeeName = String(payload.employeeName || '').trim();
  const email = String(payload.email || '').trim();
  const mobileNumber = String(payload.mobileNumber || '').trim();
  const department = String(payload.department || '').trim();
  const salary = Number(payload.salary);

  if (!employeeName) errors.push('Employee Name is required.');
  if (!email) errors.push('Email is required.');
  if (!mobileNumber) errors.push('Mobile Number is required.');
  if (!department) errors.push('Department is required.');
  if (payload.salary === undefined || payload.salary === null || payload.salary === '') {
    errors.push('Salary is required.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    errors.push('Email format is invalid.');
  }

  if (!/^\d{10}$/.test(mobileNumber)) {
    errors.push('Mobile Number must be exactly 10 digits.');
  }

  if (!Number.isFinite(salary) || salary <= 0) {
    errors.push('Salary must be a valid positive number.');
  }

  return {
    errors,
    employee: {
      employeeName,
      email,
      mobileNumber,
      department,
      salary
    }
  };
}

app.get('/api/employees', async (req, res) => {
  try {
    const employees = await readEmployees();
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch employees.' });
  }
});

app.post('/api/employees', async (req, res) => {
  try {
    const { errors, employee } = validateEmployee(req.body);
    if (errors.length) {
      return res.status(400).json({ message: 'Validation failed.', errors });
    }

    const employees = await readEmployees();
    const newEmployee = {
      id: Date.now().toString(),
      ...employee
    };

    employees.push(newEmployee);
    await writeEmployees(employees);

    return res.status(201).json(newEmployee);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to save employee.' });
  }
});

app.put('/api/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { errors, employee } = validateEmployee(req.body);

    if (errors.length) {
      return res.status(400).json({ message: 'Validation failed.', errors });
    }

    const employees = await readEmployees();
    const index = employees.findIndex((item) => item.id === id);

    if (index === -1) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    employees[index] = { ...employees[index], ...employee };
    await writeEmployees(employees);

    return res.status(200).json(employees[index]);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update employee.' });
  }
});

app.delete('/api/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const employees = await readEmployees();
    const remaining = employees.filter((item) => item.id !== id);

    if (remaining.length === employees.length) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    await writeEmployees(remaining);
    return res.status(200).json({ message: 'Employee deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete employee.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
