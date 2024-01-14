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
import {PaymentInfo} from "../../common/payment-info";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  checkoutFormGroup!: FormGroup;

  totalPrice: number = 0.00;
  totalQuantity: number = 0;

  countries: Country[] = [];

  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  storage: Storage = sessionStorage;
  localStorage: Storage = localStorage;

  stripe = Stripe(environment.stripePublishableKey);

  paymentInfo: PaymentInfo = new PaymentInfo();
  cardElement: any;
  displayError: any = '';

  constructor(
    private formBuilder: FormBuilder,
    private checkoutFormService: CheckoutFormService,
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.setupStripePaymentForm();

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group(this.getCustomerControls()),
      shippingAddress: this.formBuilder.group(this.getAddressControls()),
      billingAddress: this.formBuilder.group(this.getAddressControls()),
      creditCard: this.formBuilder.group({})
    });

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
    this.setPurchaseShippingAddress(purchase);
    this.setPurchaseBillingAddress(purchase);
    purchase.order = new Order(this.totalQuantity, this.totalPrice);
    purchase.orderItems = this.cartService.cartItems.map(item => new OrderItem(item));

    this.paymentInfo.amount = Math.round(this.totalPrice * 100);
    this.paymentInfo.currency = 'USD';

    if (!this.checkoutFormGroup.invalid && this.displayError.textContent === '')
      this.createPaymentIntent(purchase);

    else
      this.checkoutFormGroup.markAllAsTouched();
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

  private getCustomerControls() {
    return {
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
        JSON.parse(this.storage.getItem('userEmail')!),
        [
          Validators.required,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')
        ]
      )
    };
  }

  private getAddressControls() {
    return {
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
    };
  }

  private createPaymentIntent(purchase: Purchase) {
    this.checkoutService.createPaymentIntent(this.paymentInfo).subscribe(
      paymentIntentResponse => {
        this.stripe.confirmCardPayment(
          paymentIntentResponse.client_secret, {payment_method: {card: this.cardElement}}, {handleActions: false}
        ).then((result: any) => {
          if (result.error)
            alert(`There was an error: ${result.error.message}`);
          else
            this.checkoutService.placeOrder(purchase).subscribe({
              next: (response: any) => {
                alert(`Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`);
                this.resetCart();
              },
              error: (err: any) => alert(`There was an error: ${err.message}`)
            });
        })
      }
    );
  }

  private resetCart() {
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);

    this.checkoutFormGroup.reset();

    this.localStorage.removeItem('cartItems');

    this.router.navigateByUrl('/products');
  }

  private setupStripePaymentForm() {
    this.cardElement = this.stripe.elements().create('card', {hidePostalCode: true});
    this.cardElement.mount('#card-element');
    this.cardElement.on('change', (event: any) => {
      this.displayError = document.getElementById('card-errors');
      if (event.complete)
        this.displayError.textContent = '';
      else if (event.error)
        this.displayError.textContent = event.error.message;
    });
  }

  private setPurchaseBillingAddress(purchase: Purchase) {
    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.billingAddress.state = billingState.name;
    purchase.billingAddress.country = billingCountry.name;
  }

  private setPurchaseShippingAddress(purchase: Purchase) {
    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.state = shippingState.name;
    purchase.shippingAddress.country = shippingCountry.name;
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
}
