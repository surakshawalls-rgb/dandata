import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { Supabase } from '../../core/services/supabase';

interface DonationForm {
  donorName: string;
  mobile: string;
  address: string;
  amount: number | null;
  donationDate: string;
}

@Component({
  selector: 'app-admin-donation',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-donation.component.html',
  styleUrl: './admin-donation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDonationComponent implements OnInit {

  form: DonationForm = {
    donorName: '',
    mobile: '',
    address: '',
    amount: null,
    donationDate: this.getToday(),
  };

  saving = false;
  saved = false;
  errorMessage = '';
  whatsappUrl = '';

  constructor(
    private readonly auth: AuthService,
    private readonly supabase: Supabase,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.auth.waitForInitialization();

    const user = this.auth.getUser();

    if (!user) {
      await this.router.navigate([
        '/login',
      ]);

      return;
    }

    this.cdr.markForCheck();
  }


  // ==========================================
  // MOBILE INPUT VALIDATION
  // ==========================================

  onMobileInput(): void {
    this.form.mobile = String(
      this.form.mobile ?? '',
    )
      .replace(/\D/g, '')
      .slice(0, 10);

    this.cdr.markForCheck();
  }


  // ==========================================
  // DONATION AMOUNT INPUT VALIDATION
  // ==========================================

  onAmountInput(): void {
    const digits = String(
      this.form.amount ?? '',
    )
      .replace(/\D/g, '')
      .slice(0, 5);

    this.form.amount =
      digits.length > 0
        ? Number(digits)
        : null;

    this.cdr.markForCheck();
  }


  // ==========================================
  // SAVE DONATION
  // ==========================================

  async saveDonation(): Promise<void> {

    if (this.saving) {
      return;
    }

    this.errorMessage = '';
    this.saved = false;


    // Make sure mobile is clean
    this.onMobileInput();


    // Make sure amount is clean
    this.onAmountInput();


    // Final validation
    if (!this.isFormValid()) {

      this.errorMessage =
        'कृपया सभी आवश्यक जानकारी सही तरीके से दर्ज करें।';

      this.cdr.markForCheck();

      return;
    }


    this.saving = true;

    this.cdr.markForCheck();


    try {

      // ==========================================
      // ORGANIZATION
      // ==========================================

      const {
        data: organization,
        error: organizationError,
      } = await this.supabase
        .from('organizations')
        .select('id')
        .eq('slug', 'daandata')
        .maybeSingle();


      if (organizationError) {
        throw organizationError;
      }


      if (!organization) {

        throw new Error(
          'Samiti organization was not found.',
        );

      }


      // ==========================================
      // DONOR
      // ==========================================

      const {
        data: donor,
        error: donorError,
      } = await this.supabase
        .from('donors')
        .insert({
          organization_id:
            organization.id,

          full_name:
            this.form.donorName.trim(),

          phone:
            this.form.mobile.trim(),

          address:
            this.form.address.trim(),

          is_anonymous: false,

          is_active: true,
        })
        .select('id')
        .single();


      if (donorError) {
        throw donorError;
      }


      // ==========================================
      // DONATION
      // ==========================================

      const {
        data: donation,
        error: donationError,
      } = await this.supabase
        .from('donations')
        .insert({
          organization_id:
            organization.id,

          donor_id:
            donor.id,

          amount:
            this.form.amount,

          currency:
            'INR',

          payment_method:
            'cash',

          payment_status:
            'successful',

          donor_name_snapshot:
            this.form.donorName.trim(),

          donated_at:
            `${this.form.donationDate}T12:00:00`,
        })
        .select('id')
        .single();


      if (donationError) {
        throw donationError;
      }


      // ==========================================
      // WHATSAPP
      // ==========================================

      this.whatsappUrl =
        this.createWhatsAppUrl(
          donation.id,
        );


      this.saved = true;


      this.cdr.markForCheck();

    } catch (error) {

      console.error(
        'Failed to save donation:',
        error,
      );


      this.errorMessage =
        'दान सुरक्षित नहीं हो सका। कृपया पुनः प्रयास करें।';


      this.cdr.markForCheck();

    } finally {

      this.saving = false;

      this.cdr.markForCheck();

    }

  }


  // ==========================================
  // OPEN WHATSAPP
  // ==========================================

  openWhatsApp(): void {

    if (!this.whatsappUrl) {
      return;
    }

    window.open(
      this.whatsappUrl,
      '_blank',
      'noopener,noreferrer',
    );

  }


  // ==========================================
  // BACK TO DASHBOARD
  // ==========================================

  goBack(): void {

    void this.router.navigate([
      '/admin',
    ]);

  }


  // ==========================================
  // FORM VALIDATION
  // ==========================================

  private isFormValid(): boolean {

    const donorName =
      this.form.donorName.trim();

    const mobile =
      this.form.mobile.trim();

    const address =
      this.form.address.trim();

    const amount =
      this.form.amount;


    // Donor name
    if (donorName.length === 0) {
      return false;
    }


    // Mobile must be EXACTLY 10 digits
    if (!/^\d{10}$/.test(mobile)) {
      return false;
    }


    // Address
    if (address.length === 0) {
      return false;
    }


    // Amount
    if (
      amount === null ||
      !Number.isInteger(amount) ||
      amount < 1 ||
      amount > 99999
    ) {
      return false;
    }


    // Donation date
    if (
      !this.form.donationDate ||
      this.form.donationDate.length === 0
    ) {
      return false;
    }


    return true;
  }


  // ==========================================
  // WHATSAPP URL
  // ==========================================

  private createWhatsAppUrl(
  donationId: string,
): string {

  const mobile =
    this.normaliseMobile(
      this.form.mobile,
    );

  const amount =
    this.formatAmount(
      Number(this.form.amount),
    );

  const donationDate =
    new Intl.DateTimeFormat(
      'hi-IN',
      {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      },
    ).format(
      new Date(`${this.form.donationDate}T12:00:00`),
    );

  const donorName =
    this.form.donorName.trim();

  const message = [
    'श्री विश्वकर्मा मंदिर एवं सेवा समिति',
    '',
    'दान की पुष्टि',
    '',
    `श्री ${donorName} जी,`,
    '',
    `आपके द्वारा ${amount} का सहयोग दिनांक ${donationDate} को प्राप्त हुआ।`,
    '',
    `पता: ${this.form.address.trim()}`,
    `दान ID: ${donationId}`,
    '',
    'श्री विश्वकर्मा मंदिर एवं सेवा समिति के प्रति आपके सहयोग के लिए हार्दिक धन्यवाद।',
    '',
    'श्री विश्वकर्मा मंदिर एवं सेवा समिति',
  ].join('\n');

  return `https://wa.me/${mobile}?text=${encodeURIComponent(message)}`;
}


  // ==========================================
  // NORMALISE MOBILE
  // ==========================================

  private normaliseMobile(
    mobile: string,
  ): string {

    const digits =
      mobile.replace(
        /\D/g,
        '',
      );


    if (digits.startsWith('91')) {
      return digits;
    }


    return `91${digits}`;
  }


  // ==========================================
  // FORMAT AMOUNT
  // ==========================================

  private formatAmount(
    amount: number,
  ): string {

    return new Intl.NumberFormat(
      'en-IN',
      {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      },
    ).format(amount);

  }


  // ==========================================
  // TODAY
  // ==========================================

  private getToday(): string {

    const now = new Date();

    const year =
      now.getFullYear();

    const month =
      String(
        now.getMonth() + 1,
      ).padStart(2, '0');

    const day =
      String(
        now.getDate(),
      ).padStart(2, '0');


    return `${year}-${month}-${day}`;
  }

}