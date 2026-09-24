import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';

interface PublicDonation {
  id: number;
  donor_name: string;
  amount: number;
  note?: string;

  /**
   * Some contributions may already be included
   * in another consolidated entry.
   *
   * Example:
   * रामबली पांडेय ₹1,500 is already included
   * in the दान पत्र / दान पेटी total.
   */
  includedInTotal: boolean;
}

interface InKindContribution {
  id: number;
  contributor: string;
  items: string[];
}

interface PublicExpense {
  id: number;
  description: string;
  amount: number;
  note?: string;
}

type SortColumn =
  | 'donor_name'
  | 'amount';

type SortDirection =
  | 'asc'
  | 'desc';

@Component({
  selector: 'app-public-donations',
  standalone: true,
  imports: [],
  templateUrl: './public-donations.component.html',
  styleUrl: './public-donations.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicDonationsComponent {

  /*
   * ============================================================
   * 2026 PUBLIC FINANCIAL REPORT
   * ============================================================
   *
   * Temporary hardcoded data.
   *
   * Later this can be replaced with Supabase/API data.
   */

  readonly donations: PublicDonation[] = [

    {
      id: 1,
      donor_name: 'घनश्याम विश्वकर्मा',
      amount: 18000,
      note: '₹15,000 नकद + ₹3,000 बैंक',
      includedInTotal: true,
    },

    {
      id: 2,
      donor_name: 'फूल चंद्र सरोज भोनू',
      amount: 15000,
      includedInTotal: true,
    },

    {
      id: 3,
      donor_name: 'प्रदीप विश्वकर्मा',
      amount: 10000,
      includedInTotal: true,
    },

    {
      id: 4,
      donor_name: 'शिव प्रकाश विश्वकर्मा',
      amount: 8500,
      includedInTotal: true,
    },

    {
      id: 5,
      donor_name: 'शिवलाल विश्वकर्मा',
      amount: 7100,
      note: '₹2,000 नकद + ₹5,100 बैंक',
      includedInTotal: true,
    },

    {
      id: 6,
      donor_name: 'अभिषेक कुमार मिश्रा',
      amount: 5551,
      includedInTotal: true,
    },

    {
      id: 7,
      donor_name: 'दान पत्र / दान पेटी',
      amount: 3940,
      note: '₹3,684 नकद + ₹256 बैंक',
      includedInTotal: true,
    },

    {
      id: 8,
      donor_name: 'राजेश कुमार विश्वकर्मा',
      amount: 3000,
      includedInTotal: true,
    },

    {
      id: 9,
      donor_name: 'विकास विश्वकर्मा',
      amount: 2500,
      includedInTotal: true,
    },

    {
      id: 10,
      donor_name: 'विजेन्द्र बहादुर विश्वकर्मा',
      amount: 2000,
      includedInTotal: true,
    },

    {
      id: 11,
      donor_name: 'रसीद क्रमांक 5 – ब्राह्मण बस्ती',
      amount: 2059,
      includedInTotal: true,
    },

    {
      id: 12,
      donor_name: 'रसीद क्रमांक 4 – विश्वकर्मा + सरोज बस्ती',
      amount: 2044,
      includedInTotal: true,
    },

    {
      id: 13,
      donor_name: 'बलिस्टर विश्वकर्मा',
      amount: 1900,
      note: '₹800 नकद + ₹1,100 बैंक',
      includedInTotal: true,
    },

    {
      id: 14,
      donor_name: 'जितेंद्र विश्वकर्मा (केला)',
      amount: 1400,
      includedInTotal: true,
    },

    {
      id: 15,
      donor_name: 'लवकुश प्रजापति',
      amount: 1151,
      includedInTotal: true,
    },

    {
      id: 16,
      donor_name: 'विपिन विश्वकर्मा',
      amount: 1111,
      note: '₹1,000 + ₹111',
      includedInTotal: true,
    },

    {
      id: 17,
      donor_name: 'विमलेश कुमार (अजय विश्वकर्मा)',
      amount: 1111,
      includedInTotal: true,
    },

    {
      id: 18,
      donor_name: 'अंकित विश्वकर्मा',
      amount: 1111,
      includedInTotal: true,
    },

    {
      id: 19,
      donor_name: 'हौसिला प्रसाद विश्वकर्मा',
      amount: 1101,
      includedInTotal: true,
    },

    {
      id: 20,
      donor_name: 'नाजू विश्वकर्मा',
      amount: 1100,
      note: 'घनश्याम विश्वकर्मा के भैने',
      includedInTotal: true,
    },

    {
      id: 21,
      donor_name: 'दिलीप विश्वकर्मा (कलेक्टर)',
      amount: 1000,
      includedInTotal: true,
    },

    {
      id: 22,
      donor_name: 'चंदा / पिंटू सरोज से प्राप्त',
      amount: 575,
      includedInTotal: true,
    },

    {
      id: 23,
      donor_name: 'प्रमोद विश्वकर्मा',
      amount: 551,
      includedInTotal: true,
    },

    {
      id: 24,
      donor_name: 'चंद्रेश यादव',
      amount: 501,
      includedInTotal: true,
    },

    {
      id: 25,
      donor_name: 'संतोष विश्वकर्मा',
      amount: 501,
      includedInTotal: true,
    },

    {
      id: 26,
      donor_name: 'सुरेन्द्र विश्वकर्मा',
      amount: 501,
      includedInTotal: true,
    },

    {
      id: 27,
      donor_name: 'मृत्युंजय सरोज',
      amount: 501,
      includedInTotal: true,
    },

    {
      id: 28,
      donor_name: 'सागर विश्वकर्मा',
      amount: 501,
      includedInTotal: true,
    },

    {
      id: 29,
      donor_name: 'महेश सरोज डब्बू',
      amount: 501,
      includedInTotal: true,
    },

    {
      id: 30,
      donor_name: 'राजेश कुमार',
      amount: 501,
      includedInTotal: true,
    },

    {
      id: 31,
      donor_name: 'भोला शंकर विश्वकर्मा',
      amount: 500,
      includedInTotal: true,
    },

    {
      id: 32,
      donor_name: 'नीरज कुमार यादव',
      amount: 500,
      includedInTotal: true,
    },

    {
      id: 33,
      donor_name: 'पंचायत सहायक',
      amount: 408,
      note: '₹51 × 8',
      includedInTotal: true,
    },

    {
      id: 34,
      donor_name: 'धीरज कुमार',
      amount: 201,
      includedInTotal: true,
    },

    {
      id: 35,
      donor_name: 'राजेश कुमार मिश्रा',
      amount: 201,
      includedInTotal: true,
    },

    {
      id: 36,
      donor_name: 'रसीद क्रमांक 1 – कलेक्टर विश्वकर्मा',
      amount: 200,
      includedInTotal: true,
    },

    {
      id: 37,
      donor_name: 'पाठक सरोज',
      amount: 152,
      includedInTotal: true,
    },

    {
      id: 38,
      donor_name: 'जितेंद्र नारायण महाराज',
      amount: 151,
      includedInTotal: true,
    },

    {
      id: 39,
      donor_name: 'महेश प्रजापति',
      amount: 151,
      includedInTotal: true,
    },

    {
      id: 40,
      donor_name: 'अवनीश मिश्रा',
      amount: 101,
      includedInTotal: true,
    },

    {
      id: 41,
      donor_name: 'दशरथ सरोज',
      amount: 100,
      includedInTotal: true,
    },

    {
      id: 42,
      donor_name: 'नागेन्द्र कुमार',
      amount: 51,
      includedInTotal: true,
    },

    /*
     * New entries
     */

    {
      id: 43,
      donor_name: 'चंद्र भूषण त्रिपाठी (जिला पंचायत सदस्य)',
      amount: 2101,
      note: '₹2,101 नकद',
      includedInTotal: true,
    },

    {
      id: 44,
      donor_name: 'रामसागर यादव (प्रधान)',
      amount: 1501,
      note: '₹1,501 नकद',
      includedInTotal: true,
    },

    {
      id: 45,
      donor_name: 'रामबली पांडेय (पूर्व प्रधान) डंगहर',
      amount: 1500,
      note: 'राशि दान पेटी में पहले से शामिल है — कुल प्राप्ति में दोबारा नहीं जोड़ी गई',
      includedInTotal: false,
    },
  ];


  /*
   * ============================================================
   * IN-KIND CONTRIBUTIONS
   * ============================================================
   */

  readonly inKindContributions: InKindContribution[] = [

    {
      id: 1,
      contributor: 'नन्हकऊ विश्वकर्मा',
      items: [
        'प्रसाद',
        'लाचीदाना + सिंगदाना',
      ],
    },

    {
      id: 2,
      contributor: 'इन्द्रेश विश्वकर्मा',
      items: [
        'विसर्जन प्रसाद',
        'लाई + नमकीन + सिंगदाना',
      ],
    },

    {
      id: 3,
      contributor: 'राधेश्याम यादव',
      items: [
        'आलू – 3 kg',
        'आटा – 5 kg',
        'रिफाइन पैकेट तेल – 1 लीटर',
      ],
    },

    {
      id: 4,
      contributor: 'सत्यनारायण यादव',
      items: [
        'आटा – 15 kg',
      ],
    },

    {
      id: 5,
      contributor: 'राजेश सरोज (BDC)',
      items: [
        'गेहूं – 50 kg',
        'सफाई के बाद बचा गेहूं लगभग 45 kg',
      ],
    },

    {
      id: 6,
      contributor: 'छोटेलाल सरोज',
      items: [
        'प्रसाद – 5 kg',
      ],
    },

    {
      id: 7,
      contributor: 'प्रकाश शुक्ला (कोटेदार)',
      items: [
        'गेहूं – 50 kg',
      ],
    },
  ];


  /*
   * ============================================================
   * EXPENSES
   * ============================================================
   */

  readonly expenses: PublicExpense[] = [

    {
      id: 1,
      description: 'दूध दही प्रसाद के लिए',
      amount: 500,
    },

    {
      id: 2,
      description: 'मूर्ति + मूर्ति रिपेयर',
      amount: 12000,
    },

    {
      id: 3,
      description: 'रसीद और कार्ड',
      amount: 2200,
    },

    {
      id: 4,
      description: 'बैनर',
      amount: 1400,
    },

    {
      id: 5,
      description: 'मूर्ति आते समय डी.जे. और डीजल',
      amount: 2500,
    },

    {
      id: 6,
      description: 'पूजा के लिए कपड़ा',
      amount: 2900,
    },

    {
      id: 7,
      description: 'पूजा सामान',
      amount: 2400,
    },

    {
      id: 8,
      description: 'मूर्ति आते समय भाड़ा',
      amount: 500,
    },

    {
      id: 9,
      description: 'मिट्टी (₹600 × 2)',
      amount: 1200,
    },

    {
      id: 10,
      description: 'रावीस',
      amount: 1000,
    },

    {
      id: 11,
      description: 'पंडाल सजावट',
      amount: 1200,
    },

    {
      id: 12,
      description: 'पटाखा और अबीर',
      amount: 1030,
    },

    {
      id: 13,
      description: 'फल',
      amount: 2100,
    },

    {
      id: 14,
      description: 'माल फूल',
      amount: 520,
    },

    {
      id: 15,
      description: 'पानी बोतल आदि मुख्य अतिथि के लिए',
      amount: 1235,
    },

    {
      id: 16,
      description: 'भंडारा किराना सामान',
      amount: 25508,
    },

    {
      id: 17,
      description: 'हलवाई',
      amount: 4500,
    },

    {
      id: 18,
      description: 'संगीत और झांकी',
      amount: 11000,
    },

    {
      id: 19,
      description: 'पंडित (₹1,100 × 2)',
      amount: 2200,
    },

    {
      id: 20,
      description: 'नाई',
      amount: 300,
    },

    {
      id: 21,
      description: 'कुहार',
      amount: 600,
    },

    {
      id: 22,
      description: 'मुसहर',
      amount: 150,
    },

    {
      id: 23,
      description: 'टेंट',
      amount: 7000,
    },

    {
      id: 24,
      description: 'सुंदर कांड पुस्तक',
      amount: 400,
    },

    {
      id: 25,
      description: '17 सितंबर डीजल',
      amount: 1000,
    },

    {
      id: 26,
      description: 'आटा',
      amount: 1750,
    },

    {
      id: 27,
      description: 'सब्जी',
      amount: 2560,
    },

    {
      id: 28,
      description: 'आयोजन का पास',
      amount: 300,
    },

    {
      id: 29,
      description: 'आटा पिसाई दोन चाय गिलास',
      amount: 630,
    },

    {
      id: 30,
      description: 'गैस (₹1,060 × 2)',
      amount: 2120,
    },

    {
      id: 31,
      description: 'राशि दर्ज है, विवरण उपलब्ध नहीं',
      amount: 1500,
    },

    {
      id: 32,
      description: 'गैस चूल्हा',
      amount: 150,
    },

    {
      id: 33,
      description: 'विसर्जन के बाद नाश्ता',
      amount: 720,
    },

    {
      id: 34,
      description: 'विसर्जन के समय डी.जे.',
      amount: 2000,
    },
  ];


  /*
   * ============================================================
   * FINAL REPORT TOTALS
   * ============================================================
   */

  readonly reportedTotalReceived = 101630;

readonly reportedCashReceived = 73459;

readonly reportedBankReceived = 28171;

readonly reportedTotalExpense = 97073;

readonly reportedBalance =
  this.reportedTotalReceived -
  this.reportedTotalExpense;


  /*
   * ============================================================
   * SORTING
   * ============================================================
   */

  sortColumn: SortColumn = 'amount';

  sortDirection: SortDirection = 'desc';


  get sortedDonations(): PublicDonation[] {

    const direction =
      this.sortDirection === 'asc'
        ? 1
        : -1;

    return [...this.donations].sort((a, b) => {

      const comparison =
        this.sortColumn === 'donor_name'
          ? a.donor_name.localeCompare(
              b.donor_name,
              'hi',
            )
          : a.amount - b.amount;

      return comparison * direction;
    });
  }


  /*
   * Only entries that are actually part of the
   * consolidated ₹98,028 total are included.
   *
   * Therefore रामबली पांडेय ₹1,500 is displayed
   * but excluded from this calculation.
   */

  get itemizedDonationTotal(): number {

    return this.donations
      .filter(
        donation => donation.includedInTotal,
      )
      .reduce(
        (total, donation) =>
          total + donation.amount,
        0,
      );
  }


  get excludedDonationAmount(): number {

    return this.donations
      .filter(
        donation => !donation.includedInTotal,
      )
      .reduce(
        (total, donation) =>
          total + donation.amount,
        0,
      );
  }


  get reconciliationDifference(): number {

    return (
      this.itemizedDonationTotal -
      this.reportedTotalReceived
    );
  }


  get itemizedExpenseTotal(): number {

    return this.expenses.reduce(
      (total, expense) =>
        total + expense.amount,
      0,
    );
  }


  sortBy(column: SortColumn): void {

    if (this.sortColumn === column) {

      this.sortDirection =
        this.sortDirection === 'asc'
          ? 'desc'
          : 'asc';

      return;
    }

    this.sortColumn = column;

    this.sortDirection =
      column === 'amount'
        ? 'desc'
        : 'asc';
  }


  getSortIcon(column: SortColumn): string {

    if (this.sortColumn !== column) {
      return '↕';
    }

    return this.sortDirection === 'asc'
      ? '↑'
      : '↓';
  }


  formatAmount(amount: number): string {

    return new Intl.NumberFormat(
      'en-IN',
      {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      },
    ).format(amount);
  }
}