import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {CheckoutFormService} from "../../services/checkout-form.service";
import {Country} from "../../common/country";
import {State} from "../../common/state";

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

  constructor(private formBuilder: FormBuilder, private checkoutFormService: CheckoutFormService) {
  }

  ngOnInit(): void {
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: [''],
        lastName: [''],
        email: ['']
      }),
      shippingAddress: this.formBuilder.group({
        country: [''],
        state: [''],
        city: [''],
        street: [''],
        zipCode: ['']
      }),
      billingAddress: this.formBuilder.group({
        country: [''],
        state: [''],
        city: [''],
        street: [''],
        zipCode: ['']
      }),
      creditCard: this.formBuilder.group({
        cardType: [''],
        nameOnCard: [''],
        cardNumber: [''],
        securityCode: [''],
        expirationMonth: [''],
        expirationYear: [''],
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
  }

  submit() {

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
}
