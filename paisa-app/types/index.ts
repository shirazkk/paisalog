export type Role = 'Dad' | 'Mom'

export interface Household {
  id: string
  name: string
  invite_code: string
  created_at: string
}

export interface Profile {
  id: string
  household_id: string | null
  display_name: string
  role: Role
  created_at: string
}

export type Category = 'Home Expenses' | 'Grocery' | 'Utility' | 'Personal' | 'Other'

export interface Transaction {
  id: string
  household_id: string
  logged_by: string
  giver_id: string
  receiver_id: string
  amount: number
  category: Category
  txn_date: string
  note: string | null
  logged_at: string
}
