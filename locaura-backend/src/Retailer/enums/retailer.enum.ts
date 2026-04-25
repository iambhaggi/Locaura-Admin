export enum BusinessType {
    INDIVIDUAL = 'Individual',
    PARTNERSHIP = 'Partnership',
    PRIVATE_LIMITED = 'Private Limited',
    PUBLIC_LIMITED = 'Public Limited'
}

export enum RetailerStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    PENDING = 'pending',
    SUSPENDED = 'suspended'
}

export enum RiderStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    PENDING = 'pending',
    SUSPENDED = 'suspended',
    REJECTED = 'rejected'
}

export enum RiderDocumentStatus {
    PENDING = 'pending',
    VERIFIED = 'verified',
    REJECTED = 'rejected'
}

export enum PayoutStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    PAID = 'paid',
    FAILED = 'failed'
}
