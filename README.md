# devikrupa-store-backend

## API Documentation

### Authentication & User Management  
All `/auth` routes are defined in [routes/authRoutes.js](routes/authRoutes.js)  
- **POST /auth/register**  
  Register a new user.  
  Request body:
  ```json
  {
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "password": "secret",
    "role": "user"
  }
  ```
  Optional file: `image` (multipart/form-data)

- **POST /auth/login**  
  Login user (returns JWT cookie & body token).  
  Request body:
  ```json
  {
    "email": "john@example.com",
    "password": "secret"
  }
  ```

- **GET /auth** (admin only)  List all users.  
  Header: `Cookie: token=<JWT>` or `Authorization: Bearer <JWT>`

- **GET /auth/:userId** (admin only)  
  Get a single user by numeric `userId`.

- **PUT /auth/:userId** (admin only)  
  Update user info.  
  Request body fields: `firstname`, `lastname`, `email`, `phone`  
  Optional file: `image` (multipart/form-data)

- **DELETE /auth/:userId** (admin only)  
  Delete a user.

---

### Categories  
All `/categories` routes are in [routes/categoryRoutes.js](routes/categoryRoutes.js)

#### GET /categories  
Retrieve all categories, sorted by their `categoryId`.  
Request:
```http
GET /categories HTTP/1.1
Host: devikrupa-store-backend
Authorization: Bearer <token>
```

- **POST /categories** (admin only)  
  Create category.  
  Request body:
  ```json
  {
    "categoryName": "Electronics",
    "description": "Gadgets and devices"
  }
  ```
  File: `categoryImage` (multipart/form-data)

- **PUT /categories/:categoryId** (admin only)  
  Update a category. Same fields as create; optional `categoryImage`.

- **DELETE /categories/:categoryId** (admin only)  
  Delete a category.

Response (200):
```json
[
  {
    "_id": "64e...",
    "categoryId": 1,
    "categoryName": "Electronics",
    "description": "Gadgets and devices",
    "categoryImage": "/uploads/category-1617891234567.png",
    "createdAt": "2025-05-21T12:34:56.789Z",
    "updatedAt": "2025-05-21T12:34:56.789Z"
  },
  {
    "_id": "64f...",
    "categoryId": 2,
    "categoryName": "Home Appliances",
    "description": "Kitchen and home",
    "categoryImage": null,
    "createdAt": "2025-05-22T08:15:30.123Z",
    "updatedAt": "2025-05-22T08:15:30.123Z"
  }
]
```

Response (201):
```json
{
  "status": 201,
  "message": "Category created successfully",
  "data": {
    "newCategory": {
      "_id": "650...",
      "categoryId": 3,
      "categoryName": "Gardening",
      "description": "Tools for your garden",
      "categoryImage": "/uploads/category-1620000000000.png",
      "createdAt": "2025-05-22T10:00:00.000Z",
      "updatedAt": "2025-05-22T10:00:00.000Z"
    }
  }
}
```

Response (200) - Update Category:
```json
{
  "status": 200,
  "message": "Category updated successfully",
  "category": {
    "_id": "650...",
    "categoryId": 3,
    "categoryName": "Gardening",
    "description": "Outdoor gardening tools",
    "categoryImage": "/uploads/category-1620000000000.png",
    "createdAt": "2025-05-22T10:00:00.000Z",
    "updatedAt": "2025-05-22T11:00:00.000Z"
  }
}
```

Response (404) - Update Category:
```json
{ "success": false, "status": 404, "message": "Category not found" }
```

Response (200) - Delete Category:
```json
{ "status": 200, "message": "Category deleted successfully" }
```

---

### Products  
All `/products` routes in [routes/productRoutes.js](routes/productRoutes.js)  
- **GET /products**  
  List all products. Populates `category`.

- **GET /products/:productId**  
  Get single product details.

- **POST /products** (admin only)  
  Create a product.  
  Request body:
  ```json
  {
    "name": "Widget",
    "companyName": "Acme",
    "description": "A useful widget",
    "price": 19.99,
    "category": 1,      // numeric categoryId
    "stock": 100,
    "rating": 4.5
  }
  ```
  Files: `productImages` (up to 6 images, multipart/form-data)

- **PUT /products/:productId** (admin only)  
  Update product fields (same as create); optional new `productImages`.

- **DELETE /products/:productId** (admin only)  
  Delete a product.

---

### Orders  
All `/orders` routes in [routes/orderRoutes.js](routes/orderRoutes.js)  
- **POST /orders** (auth required)  
  Create an order.  
  Request body:
  ```json
  {
    "products": [
      { "product": "64b...", "quantity": 2 },
      { "product": "64c...", "quantity": 1 }
    ],
    "totalPrice": 59.97
  }
  ```

- **GET /orders/my** (auth required)  
  Get orders of the logged-in user.

- **GET /orders** (admin only)  
  List all orders (populates user & products).

- **PUT /orders/:id** (admin only)  
  Update order status.  
  Request body:
  ```json
  { "status": "Shipped" }
  ```

---

### File Uploads  
Handled by [middleware/uploadMiddleware.js](middleware/uploadMiddleware.js):  
- Category image field `categoryImage`  
- User avatar `image`  
- Product gallery `productImages[]`

---

## Running the App

```bash
npm install
npm run dev
```

Ensure your `.env` has valid `MONGO_URI` and `JWT_SECRET`.