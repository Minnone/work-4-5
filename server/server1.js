const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8000;
const HOST = '127.0.0.1';

app.use(cors());
app.use(express.json());
const dataPath = path.join(__dirname, '..', 'date', 'products.json');
// Чтение данных из файла
const getProducts = () => {
    const data = fs.readFileSync(dataPath);
    return JSON.parse(data);
};

// Маршрут для добавления нового продукта
app.post('/api/admin/products', (req, res) => {
    const newProduct = req.body;
    const data = getProducts();
    newProduct.id = data.products.length + 1; // Присваиваем новый ID
    data.products.push(newProduct);
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    res.status(201).json(newProduct);
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../front', 'admin.html'));
});

// Маршрут для редактирования продукта
app.put('/api/admin/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const updatedProduct = req.body;
    const data = getProducts();
    const index = data.products.findIndex(product => product.id === id);
    if (index !== -1) {
        data.products[index] = { ...data.products[index], ...updatedProduct };
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        res.json(data.products[index]);
    } else {
        res.status(404).send('Продукт не найден');
    }
});

// Маршрут для удаления продукта
app.delete('/api/admin/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const data = getProducts();
    const index = data.products.findIndex(product => product.id === id);
    if (index !== -1) {
        data.products.splice(index, 1);
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        res.status(204).send();
    } else {
        res.status(404).send('Продукт не найден');
    }
});

// Маршрут для получения всех продуктов
app.get('/api/admin/products', (req, res) => {
    const data = getProducts();
    res.json(data.products);
});

// Запуск сервера на 127.0.0.1:8000
app.listen(PORT, HOST, () => {
    console.log(`Admin server running on http://${HOST}:${PORT}`);
});