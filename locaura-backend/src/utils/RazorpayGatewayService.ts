import Razorpay from 'razorpay';
import crypto from 'crypto';

interface CreateOrderInput {
    amount: number;
    currency?: string;
    receipt: string;
    notes?: Record<string, string>;
}

interface RefundInput {
    payment_id: string;
    amount_in_paise?: number;
    speed?: 'normal' | 'optimum';
    notes?: Record<string, string>;
}

interface BankPayoutInput {
    amount_in_paise: number;
    reference_id: string;
    account_number: string;
    ifsc: string;
    account_holder_name: string;
    narration?: string;
    notes?: Record<string, string>;
}

interface VpaPayoutInput {
    amount_in_paise: number;
    reference_id: string;
    vpa: string;
    beneficiary_name: string;
    narration?: string;
    notes?: Record<string, string>;
}

export class RazorpayGatewayService {
    private razorpay: Razorpay | null = null;

    private get_razorpay_client(): Razorpay {
        if (this.razorpay) {
            return this.razorpay;
        }

        const key_id = process.env.RAZORPAY_KEY_ID;
        const key_secret = process.env.RAZORPAY_KEY_SECRET;

        if (!key_id || !key_secret) {
            throw new Error('Razorpay keys are not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET');
        }

        this.razorpay = new Razorpay({ key_id, key_secret });
        return this.razorpay;
    }

    private get_signature_secret(): string {
        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) {
            throw new Error('RAZORPAY_KEY_SECRET is not configured');
        }

        return secret;
    }

    private get_webhook_secret(service: 'payments' | 'payouts'): string {
        const primary = service === 'payouts'
            ? process.env.RAZORPAY_PAYOUT_WEBHOOK_SECRET
            : process.env.RAZORPAY_WEBHOOK_SECRET;

        if (primary) {
            return primary;
        }

        const fallback = process.env.RAZORPAY_WEBHOOK_SECRET;
        if (fallback) {
            return fallback;
        }

        throw new Error('Razorpay webhook secret is not configured');
    }

    private get_source_account_number(): string {
        const account_number = process.env.RAZORPAYX_SOURCE_ACCOUNT_NUMBER;
        if (!account_number) {
            throw new Error('RAZORPAYX_SOURCE_ACCOUNT_NUMBER is not configured for payouts');
        }

        return account_number;
    }

    create_payment_signature(order_id: string, payment_id: string): string {
        const body = `${order_id}|${payment_id}`;
        return crypto
            .createHmac('sha256', this.get_signature_secret())
            .update(body)
            .digest('hex');
    }

    verify_payment_signature(order_id: string, payment_id: string, signature: string): boolean {
        const expected = this.create_payment_signature(order_id, payment_id);
        return expected === signature;
    }

    verify_webhook_signature(payload: unknown, signature: string, service: 'payments' | 'payouts'): boolean {
        const secret = this.get_webhook_secret(service);
        const body = JSON.stringify(payload);

        const generated = crypto
            .createHmac('sha256', secret)
            .update(body)
            .digest('hex');

        return generated === signature;
    }

    async create_order(input: CreateOrderInput) {
        const amount = Math.round(input.amount * 100);

        if (!Number.isFinite(amount) || amount <= 0) {
            throw new Error('Amount must be greater than 0');
        }

        return this.get_razorpay_client().orders.create({
            amount,
            currency: input.currency || 'INR',
            receipt: input.receipt,
            notes: input.notes
        });
    }

    async create_refund(input: RefundInput) {
        if (!input.payment_id) {
            throw new Error('payment_id is required for refund');
        }

        const payload: Record<string, unknown> = {
            speed: input.speed || 'normal',
            notes: input.notes
        };

        if (typeof input.amount_in_paise === 'number') {
            payload.amount = input.amount_in_paise;
        }

        return this.get_razorpay_client().payments.refund(input.payment_id, payload);
    }

    private async create_contact(name: string, reference_id: string, notes?: Record<string, string>) {
        const contacts = (this.get_razorpay_client() as any).contacts;
        if (!contacts?.create) {
            throw new Error('Razorpay contacts API is not available');
        }

        return contacts.create({
            name,
            type: 'vendor',
            reference_id,
            notes
        });
    }

    private async create_bank_fund_account(
        contact_id: string,
        account_holder_name: string,
        ifsc: string,
        account_number: string
    ) {
        const fund_accounts = (this.get_razorpay_client() as any).fundAccount;
        if (!fund_accounts?.create) {
            throw new Error('Razorpay fund account API is not available');
        }

        return fund_accounts.create({
            contact_id,
            account_type: 'bank_account',
            bank_account: {
                name: account_holder_name,
                ifsc,
                account_number
            }
        });
    }

    private async create_vpa_fund_account(contact_id: string, beneficiary_name: string, vpa: string) {
        const fund_accounts = (this.get_razorpay_client() as any).fundAccount;
        if (!fund_accounts?.create) {
            throw new Error('Razorpay fund account API is not available');
        }

        return fund_accounts.create({
            contact_id,
            account_type: 'vpa',
            vpa: {
                address: vpa,
                name: beneficiary_name
            }
        });
    }

    private async create_payout(
        fund_account_id: string,
        amount_in_paise: number,
        reference_id: string,
        mode: 'NEFT' | 'UPI',
        narration?: string,
        notes?: Record<string, string>
    ) {
        const payouts = (this.get_razorpay_client() as any).payouts;
        if (!payouts?.create) {
            throw new Error('Razorpay payouts API is not available');
        }

        return payouts.create({
            account_number: this.get_source_account_number(),
            fund_account_id,
            amount: amount_in_paise,
            currency: 'INR',
            mode,
            purpose: 'payout',
            queue_if_low_balance: true,
            reference_id,
            narration,
            notes
        });
    }

    async create_bank_payout(input: BankPayoutInput) {
        if (input.amount_in_paise <= 0) {
            throw new Error('amount_in_paise must be greater than 0');
        }

        if (!input.account_number || !input.ifsc || !input.account_holder_name) {
            throw new Error('Bank payout requires account_number, ifsc and account_holder_name');
        }

        const contact = await this.create_contact(input.account_holder_name, input.reference_id, input.notes);
        const fund_account = await this.create_bank_fund_account(
            contact.id,
            input.account_holder_name,
            input.ifsc,
            input.account_number
        );

        return this.create_payout(
            fund_account.id,
            input.amount_in_paise,
            input.reference_id,
            'NEFT',
            input.narration,
            input.notes
        );
    }

    async create_vpa_payout(input: VpaPayoutInput) {
        if (input.amount_in_paise <= 0) {
            throw new Error('amount_in_paise must be greater than 0');
        }

        if (!input.vpa || !input.beneficiary_name) {
            throw new Error('VPA payout requires vpa and beneficiary_name');
        }

        const contact = await this.create_contact(input.beneficiary_name, input.reference_id, input.notes);
        const fund_account = await this.create_vpa_fund_account(contact.id, input.beneficiary_name, input.vpa);

        return this.create_payout(
            fund_account.id,
            input.amount_in_paise,
            input.reference_id,
            'UPI',
            input.narration,
            input.notes
        );
    }
}

let razorpay_gateway_instance: RazorpayGatewayService | null = null;

export const get_razorpay_gateway = (): RazorpayGatewayService => {
    if (!razorpay_gateway_instance) {
        razorpay_gateway_instance = new RazorpayGatewayService();
    }

    return razorpay_gateway_instance;
};