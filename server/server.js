const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const dataPath = path.join(__dirname, '..', 'date', 'products.json');

// Чтение данных из json-файла
const readData = () => {
    try {
        const rawData = fs.readFileSync(dataPath);
        return JSON.parse(rawData);
    } catch (error) {
        console.error('Ошибка при чтении файла products.json:', error);
        return { products: [] }; // Возвращаем пустой массив, если файл не найден или поврежден
    }
};

// Запись данных в json-файл
const writeData = (data) => {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
};

// Раздача статических файлов из директории front
app.use(express.static(path.join(__dirname, '../front')));

// Маршрут для главной страницы
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../front', 'index.html'));
});

// Маршрут для админ-панели
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../front', 'admin.html'));
});

// Получение всех товаров
app.get('/api/products', (req, res) => {
    const data = readData();
    res.json(data.products);
});

// Получение товара по ID
app.get('/api/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const data = readData();
    const product = data.products.find(product => product.id === productId);
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

// Добавление нового товара
app.post('/api/products', (req, res) => {
    const newProduct = req.body;
    const data = readData();
    newProduct.id = data.products.length + 1; // Присваиваем новый ID
    data.products.push(newProduct);
    writeData(data);
    res.status(201).json(newProduct);
});

// Обновление товара
app.put('/api/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const updatedProduct = req.body;
    const data = readData();
    
    const index = data.products.findIndex(product => product.id === productId);
    if (index !== -1) {
        data.products[index] = { id: productId, ...updatedProduct };
        writeData(data);
        res.json(data.products[index]);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

// Удаление товара
app.delete('/api/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const data = readData();
    
    data.products = data.products.filter(product => product.id !== productId);
    writeData(data);
    res.status(204).send();
});

// Запуск сервера на порту 3000
const PORT = 3000;
const HOST = 'localhost';
app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
});