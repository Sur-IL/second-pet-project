const API = 'jsonFiles';

class List {
    constructor(url, container, list = list2) {
        this.url = url;
        this.container = container;
        this.list = list;
        this.good = [];
        this.allProducts = [];
        this.filtered = [];
        this._init();
    }
    getJson(url) {
        return fetch(url ? url : `${API + this.url}`)
            .then(result => result.json())
            .catch(error => {
                console.log(error);
            })
    }
    handleData(data) {
        this.goods = [...data];
        this.render();
    }
    render() {
        const block = document.querySelector(this.container);
        for (let product of this.goods) {
            let productObj = new this.list[this.constructor.name](product);
            this.allProducts.push(productObj);
            block.insertAdjacentHTML('beforeend', productObj.render());
        }
    }
    _init() {
        return false
    }
}

class Item {
    constructor(element) {
        this.product_name = element.product_name;
        this.product_price = element.product_price;
        this.product_id = element.product_id;
        this.product_img = element.product_img;
        this.product_discription = element.product_discription;
    }
    render() {
        return `<section class="featured__card" data-id="${this.product_id}">
        <div class="featured__img-wrap">
            <img class="card-img" src="${this.product_img}" alt="photo">
            <div class="featured__img-dark">
                <button class="buy_button" data-id="${this.product_id}"
                data-name="${this.product_name}"
                data-price="${this.product_price}" >
                    Add to cart
                </button>
            </div>
        </div>
        <div class="card__title">
            <h4 class="card-heading">${this.product_name}</h4>
            <p class="card-text">${this.product_discription}</p>
            <p class="card-price">$${this.product_price}</p>
        </div>
    </section>`
    }
}

class ProductsList extends List {
    constructor(cart, container = '.cards', url = "/catalogData.json") {
        super(url, container);
        this.cart = cart;
        this.getJson()
            .then(data => this.handleData(data));
    }
    _init() {
        document.querySelector(this.container).addEventListener('click', event => {
            if (event.target.classList.contains('buy_button')) {
                this.cart.addToCart(event.target);
            }
        })
    }
}

class ProductItem extends Item { }

class Cart extends List {
    constructor(container = ".cart__block", url = "/getBasket.json") {
        super(url, container);
        this.getJson()
            .then(data => {
                this.handleData(data.contents);
            })
    }
    addToCart(element) {
        this.getJson(`${API}/addToBasket.json`)
            .then(data => {
                if (data.result === 1) {
                    let productId = +element.dataset['id'];
                    let find = this.allProducts.find(product => product.product_id === productId);
                    if (find) {
                        find.product_quantity++;
                        this._updateCart(find);
                    } else {
                        let product = {
                            product_id: productId,
                            product_price: +element.dataset['price'],
                            product_name: element.dataset['name'],
                            product_quantity: 1
                        };
                        this.goods = [product];
                        this.render();
                    }
                } else {
                    alert('Error');
                }
            })
    }
    deleteFromCart(element) {
        this.getJson(`${API}/deleteFromBasket.json`)
            .then(data => {
                if (data.result === 1) {
                    let productId = +element.dataset['id'];
                    let find = this.allProducts.find(product => product.product_id === productId);
                    if (find.product_quantity > 1) {
                        find.product_quantity--;
                        this._updateCart(find);
                    } else {
                        this.allProducts.splice(this.allProducts.indexOf(find), 1);
                        document.querySelector(`.cart-item[data-id="${productId}"]`).remove();
                    }
                } else {
                    alert('Error');
                }
            })
    }
    _updateCart(product) {
        let block = document.querySelector(`.cart-item[data-id="${product.product_id}"]`);
        block.querySelector('.product-quantity').textContent = `Quantity: ${product.product_quantity}`;
        block.querySelector('.product-price').textContent = `$${product.product_quantity * product.product_price}`;
    }
    _init() {
        document.querySelector('.cart-img').addEventListener('click', () => {
            document.querySelector(this.container).classList.toggle('invisible');
        });
        document.querySelector(this.container).addEventListener('click', e => {
            if (e.target.classList.contains('del-btn')) {
                this.deleteFromCart(e.target);
            }
        })
    }
}

class CartItem extends Item {
    constructor(el) {
        super(el);
        this.product_quantity = el.product_quantity;
    }
    render() {
        return `<div class="cart-item" data-id="${this.product_id}">
                    <div class="product-bio">
                        <div class="product-desc">
                            <p class="product-title">${this.product_name}</p>
                            <p class="product-quantity">Quantity: ${this.product_quantity}</p>
                            <p class="product-single-price">$${this.product_price} each</p>
                        </div>
                    </div>
                    <div class="right-block">
                        <p class="product-price">$${this.product_quantity * this.product_price}</p>
                        <button class="del-btn" data-id="${this.product_id}">&times;</button>
                    </div>
                </div>`
    }
}


const list2 = {
    ProductsList: ProductItem,
    Cart: CartItem
};

let cart = new Cart();
let products = new ProductsList(cart);