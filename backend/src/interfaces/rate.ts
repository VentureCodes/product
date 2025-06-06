
interface IRate {
    id: string,
    currencyId: string,
    rateProviderId: string,
    buy: number,
    sell: number,
    createdAt: Date,
    updatedAt: Date
    datePosted: Date
}

interface IRateCategory {
    id: string,
    name: string,
    description: string | null,
    icon: string | null,
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date
}

interface IRateProvider {
    id: string,
    name: string,
    icon: string | null,
    isActive: boolean,
    rateCategoryId: string | null,
    createdAt: Date,
    updatedAt: Date
}

export interface IRateOutput {
    message: string,
    rate: IRate
}

export interface IRateCategoryOutput {
    message: string,
    rateCategory: IRateCategory
}

export interface IRateProviderOutput {
    message: string,
    rateProvider: IRateProvider
}

interface IUpdateRateData {
    currencyId?: string,
    rateProviderId?: string,
    buy?: number,
    sell?: number
}

export interface UpdateRateInput {
    rateId: string,
    data: IUpdateRateData
}

