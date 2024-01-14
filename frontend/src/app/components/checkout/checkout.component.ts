import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {CheckoutFormService} from "../../services/checkout-form.service";
import {Country} from "../../common/country";
import {State} from "../../common/state";
import {CheckoutFormValidator} from "../../validators/checkout-form-validator";
import {CartService} from "../../services/cart.service";
import {CheckoutService} from "../../services/checkout.service";
import {Router} from "@angular/router";
import {Order} from "../../common/order";
import {OrderItem} from "../../common/order-item";
import {Purchase} from "../../common/purchase";

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  checkoutFormGroup!: FormGroup;

  totalPrice: number = 0.00;
  totalQuantity: number = 0;

  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  countries: Country[] = [];

  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  storage: Storage = localStorage;

  constructor(
    private formBuilder: FormBuilder,
    private checkoutFormService: CheckoutFormService,
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl(
          '',
          [
            Validators.required,
            Validators.minLength(2),
            CheckoutFormValidator.notOnlyWhitespace
          ]
        ),
        lastName: new FormControl(
          '',
          [
            Validators.required,
            Validators.minLength(2),
            CheckoutFormValidator.notOnlyWhitespace
          ]
        ),
        email: new FormControl(
          '',
          [
            Validators.required,
            Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')
          ]
        )
      }),

      shippingAddress: this.formBuilder.group({
        country: new FormControl(
          '',
          [
            Validators.required
          ]
        ),
        state: new FormControl(
          '',
          [
            Validators.required
          ]
        ),
        city: new FormControl(
          '',
          [
            Validators.required,
            Validators.minLength(2),
            CheckoutFormValidator.notOnlyWhitespace
          ]
        ),
        street: new FormControl(
          '',
          [
            Validators.required,
            Validators.minLength(2),
            CheckoutFormValidator.notOnlyWhitespace
          ]
        ),
        zipCode: new FormControl(
          '',
          [
            Validators.required,
            Validators.minLength(2),
            CheckoutFormValidator.notOnlyWhitespace
          ]
        )
      }),

      billingAddress: this.formBuilder.group({
        country: new FormControl(
          '',
          [
            Validators.required
          ]
        ),
        state: new FormControl(
          '',
          [
            Validators.required
          ]
        ),
        city: new FormControl(
          '',
          [
            Validators.required,
            Validators.minLength(2),
            CheckoutFormValidator.notOnlyWhitespace
          ]
        ),
        street: new FormControl(
          '',
          [
            Validators.required,
            Validators.minLength(2),
            CheckoutFormValidator.notOnlyWhitespace
          ]
        ),
        zipCode: new FormControl(
          '',
          [
            Validators.required,
            Validators.minLength(2),
            CheckoutFormValidator.notOnlyWhitespace
          ]
        )
      }),

      creditCard: this.formBuilder.group({
        cardType: new FormControl(
          '',
          [
            Validators.required,
          ]
        ),
        nameOnCard: new FormControl(
          '',
          [
            Validators.required,
            Validators.minLength(2),
            CheckoutFormValidator.notOnlyWhitespace
          ]
        ),
        cardNumber: new FormControl(
          '',
          [
            Validators.required,
            Validators.pattern('[0-9]{16}')
          ]
        ),
        securityCode: new FormControl(
          '',
          [
            Validators.required,
            Validators.pattern('[0-9]{3}')
          ]
        ),
        expirationMonth: new FormControl(
          '',
          [
            Validators.required
          ]
        ),
        expirationYear: new FormControl(
          '',
          [
            Validators.required
          ]
        )
      })
    });

    const startMonth: number = new Date().getMonth() + 1;
    this.checkoutFormService.getCreditCardMonths(startMonth).subscribe(
      months => this.creditCardMonths = months
    );

    this.checkoutFormService.getCreditCardYears().subscribe(
      years => this.creditCardYears = years
    );

    this.checkoutFormService.getCountries().subscribe(
      countries => this.countries = countries
    );

    this.reviewCartDetails();
  }

  reviewCartDetails() {
    this.cartService.totalQuantity.subscribe(
      totalQuantity => this.totalQuantity = totalQuantity
    );
    this.cartService.totalPrice.subscribe(
      totalPrice => this.totalPrice = totalPrice
    );
  }

  submit() {
    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
    }

    const purchase = new Purchase();

    purchase.customer = this.checkoutFormGroup.controls['customer'].value;

    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.state = shippingState.name;
    purchase.shippingAddress.country = shippingCountry.name;

    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.billingAddress.state = billingState.name;
    purchase.billingAddress.country = billingCountry.name;

    purchase.order = new Order(this.totalQuantity, this.totalPrice);

    purchase.orderItems = this.cartService.cartItems.map(item => new OrderItem(item));

    this.checkoutService.placeOrder(purchase).subscribe(
      {
        next: response => {
          alert(`Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`);
          this.resetCart();
        },
        error: err => {
          alert(`There was an error: ${err.message}`)
        }
      }
    );
  }

  copyShippingAddressToBillingAddress(event: Event) {
    if (event.target !== null && (<HTMLInputElement>event.target).checked) {
      this.checkoutFormGroup.controls["billingAddress"].setValue(
        this.checkoutFormGroup.controls['shippingAddress'].value
      );

      this.billingAddressStates = this.shippingAddressStates;
      this.checkoutFormGroup.get('billingAddress')?.disable();
    } else {
      this.checkoutFormGroup.controls["billingAddress"].reset();
      this.billingAddressStates = [];
      this.checkoutFormGroup.get('billingAddress')?.enable();
    }
  }

  handleMonthsAndYears() {
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');

    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup?.value.expirationYear);

    let startMonth: number;
    if (currentYear === selectedYear)
      startMonth = new Date().getMonth() + 1;
    else
      startMonth = 1;

    this.checkoutFormService.getCreditCardMonths(startMonth).subscribe(
      months => this.creditCardMonths = months
    );
  }

  getStates(formGroupName: string) {
    const formGroup = this.checkoutFormGroup.get(formGroupName);
    const countryCode = formGroup?.value.country.code;
    this.checkoutFormService.getStates(countryCode).subscribe(
      states => {
        if (formGroupName === 'shippingAddress')
          this.shippingAddressStates = states;
        else if (formGroupName === 'billingAddress')
          this.billingAddressStates = states;
      }
    );
  }

  resetCart() {
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);

    this.checkoutFormGroup.reset();

    this.storage.removeItem('cartItems');

    this.router.navigateByUrl('/products');
  }

  get firstName() {
    return this.checkoutFormGroup.get('customer.firstName');
  }

  get lastName() {
    return this.checkoutFormGroup.get('customer.lastName');
  }

  get email() {
    return this.checkoutFormGroup.get('customer.email');
  }

  get shippingAddressCountry() {
    return this.checkoutFormGroup.get('shippingAddress.country');
  }

  get shippingAddressState() {
    return this.checkoutFormGroup.get('shippingAddress.state');
  }

  get shippingAddressCity() {
    return this.checkoutFormGroup.get('shippingAddress.city');
  }

  get shippingAddressStreet() {
    return this.checkoutFormGroup.get('shippingAddress.street');
  }

  get shippingAddressZipCode() {
    return this.checkoutFormGroup.get('shippingAddress.zipCode');
  }

  get billingAddressCountry() {
    return this.checkoutFormGroup.get('billingAddress.country');
  }

  get billingAddressState() {
    return this.checkoutFormGroup.get('billingAddress.state');
  }

  get billingAddressCity() {
    return this.checkoutFormGroup.get('billingAddress.city');
  }

  get billingAddressStreet() {
    return this.checkoutFormGroup.get('billingAddress.street');
  }

  get billingAddressZipCode() {
    return this.checkoutFormGroup.get('billingAddress.zipCode');
  }

  get creditCardType() {
    return this.checkoutFormGroup.get('creditCard.cardType');
  }

  get creditCardNameOnCard() {
    return this.checkoutFormGroup.get('creditCard.nameOnCard');
  }

  get creditCardNumber() {
    return this.checkoutFormGroup.get('creditCard.cardNumber');
  }

  get creditCardSecurityCode() {
    return this.checkoutFormGroup.get('creditCard.securityCode');
  }
}
