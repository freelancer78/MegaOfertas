
// =====================================================
// API — Vercel API Routes + Neon PostgreSQL
// Autenticación mediante sesión segura
// =====================================================

const API = {

  async _get(path, params = {}) {
    const url = new URL(CONFIG.API_URL + path, location.origin);

    Object.entries(params).forEach(([k, v]) => {
      url.searchParams.set(k, v);
    });

    const res = await fetch(url.toString(), {
      method: 'GET',
      credentials: 'same-origin'
    });

    return res.json();
  },

  async _post(path, data = {}) {
    const res = await fetch(CONFIG.API_URL + path, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    return res.json();
  },

  async _put(path, data = {}) {
    const res = await fetch(CONFIG.API_URL + path, {
      method: 'PUT',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    return res.json();
  },

  async _delete(path, data = {}) {
    const res = await fetch(CONFIG.API_URL + path, {
      method: 'DELETE',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    return res.json();
  },

  // -----------------------------------------------
  // AUTENTICACIÓN
  // -----------------------------------------------

  async login(key) {
    return this._post('/auth', { key });
  },

  async checkAuth() {
    return this._get('/auth');
  },

  async logout() {
    return this._delete('/auth');
  },

  // -----------------------------------------------
  // PRODUCTOS
  // -----------------------------------------------

  async getProducts() {
    return this._get('/products');
  },

  async getProductsAdmin() {
    return this._get('/products', { admin: '1' });
  },

  async addProduct(product) {
    return this._post('/products', { product });
  },

  async updateProduct(product) {
    return this._put(`/products/${product.id}`, { product });
  },

  async deleteProduct(id) {
    return this._delete(`/products/${id}`);
  },

  async reactivateProduct(id) {
    return this._post(`/products/${id}/reactivate`);
  },

  // -----------------------------------------------
  // CONFIGURACIÓN DE LA TIENDA
  // -----------------------------------------------

  async getConfig() {
    return this._get('/config');
  },

  async updateConfig(config) {
    return this._put('/config', config);
  }

};
