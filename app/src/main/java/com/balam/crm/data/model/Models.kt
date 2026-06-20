package com.balam.crm.data.model

// ---------- Auth ----------

data class LoginRequest(val identifier: String, val password: String)

data class RegisterRequest(
    val agentCode: String,
    val name: String,
    val email: String,
    val mobile: String,
    val password: String,
    val branch: String,
    val licenceNo: String
)

data class ChangePasswordRequest(val currentPassword: String, val newPassword: String)

data class UpdateProfileRequest(
    val name: String? = null,
    val mobile: String? = null,
    val email: String? = null,
    val photo: String? = null,
    val slogan: String? = null,
    val address: String? = null
)

data class Agent(
    val id: Int,
    val agentCode: String,
    val name: String,
    val mobile: String,
    val email: String?,
    val branch: String?,
    val club: String?,
    val licenceNo: String?,
    val agSince: String?,
    val renewalDate: String?,
    val pan: String?,
    val photo: String?,
    val slogan: String?,
    val newPortal: Boolean?
)

data class AuthResponse(val token: String, val expiresAt: String?, val agent: Agent)

data class MessageResponse(val message: String)

// ---------- Errors ----------

data class FieldError(val field: String, val message: String)

data class ErrorResponse(val error: String, val message: String)

data class ValidationErrorResponse(val error: String, val errors: List<FieldError>)

// ---------- Policies ----------

data class PolicyListItem(
    val id: Int,
    val policyNo: Int,
    val familyCode: String,
    val clientName: String,
    val planNo: String?,
    val planName: String?,
    val term: Int?,
    val ppt: Int?,
    val premium: Double,
    val sumAssured: Double,
    val paymentMode: String?,
    val nextPremium: String?,
    val matDate: String?,
    val status: String?,
    val fupStatus: String?,
    val daysUntilLapse: Int
)

data class FUPHistory(
    val id: Int,
    val policyNo: Int,
    val oldFup: String?,
    val newFup: String?,
    val updatedBy: String?,
    val updatedAt: String?
)

data class PolicyDetail(
    val id: Int,
    val policyNo: Int,
    val familyCode: String,
    val persCode: String?,
    val issueDate: String?,
    val matDate: String?,
    val paymentMode: String?,
    val premium: Double,
    val sumAssured: Double,
    val plan: Int?,
    val planName: String?,
    val term: Int?,
    val ppt: Int?,
    val nextPremium: String?,
    val matAmount: Double?,
    val nominee: String?,
    val relation: String?,
    val agCode: String?,
    val statCd: String?,
    val status: String?,
    val fupStatus: String?,
    val age: Int?,
    val lastPaid: String?,
    val neft: String?,
    val lastFup: String?,
    val branch: String?,
    val dab: Int?,
    val termRider: Int?,
    val fupHistory: List<FUPHistory>?,
    val loans: List<Loan>?,
    val sbRecords: List<SBItem>?
)

data class PoliciesResponse(val data: List<PolicyListItem>, val total: Int, val page: Int, val limit: Int)

data class CreatePolicyRequest(
    val policyNo: Int,
    val familyCode: String,
    val persCode: String,
    val planNo: String,
    val issueDate: String,
    val matDate: String,
    val term: Int,
    val ppt: Int,
    val sumAssured: Double,
    val premium: Double,
    val paymentMode: String,
    val nextPremium: String,
    val nominee: String,
    val relation: String,
    val branch: String? = null,
    val neft: String? = null,
    val dab: Int? = null,
    val termRider: Int? = null
)

data class UpdatePolicyRequest(
    val status: String? = null,
    val nominee: String? = null,
    val relation: String? = null,
    val neft: String? = null,
    val nextPremium: String? = null,
    val fupStatus: String? = null
)

// ---------- Families ----------

data class FamilyListItem(
    val id: Int,
    val familyCode: String,
    val headName: String?,
    val mobile: String?,
    val address: String?,
    val pincode: String?,
    val memberCount: Int,
    val policyCount: Int
)

data class CreateFamilyRequest(
    val familyCode: String? = null,
    val headName: String,
    val address: String? = null,
    val mobile: String? = null,
    val email: String? = null,
    val pincode: String? = null,
    val religion: String? = null,
    val designation: String? = null
)

data class CreateFamilyResponse(val message: String, val familyCode: String)

data class UpdateFamilyRequest(
    val familyCode: String? = null,
    val headName: String? = null,
    val address: String? = null,
    val mobile: String? = null,
    val email: String? = null,
    val pincode: String? = null,
    val religion: String? = null,
    val designation: String? = null
)

data class FamilyDetail(
    val id: Int?,
    val familyCode: String,
    val headName: String?,
    val address: String?,
    val email: String?,
    val mobile: String?,
    val pincode: String?,
    val religion: String?,
    val designation: String?,
    val lastUpdate: String?,
    val members: List<Client>?,
    val policies: List<PolicyListItem>?
)

data class FamiliesResponse(val data: List<FamilyListItem>, val total: Int, val page: Int, val limit: Int)

// ---------- Clients ----------

data class Client(
    val id: Int,
    val familyCode: String,
    val persCode: String?,
    val name: String?,
    val mobile: String?,
    val dob: String?,
    val sex: String?,
    val address: String?,
    val email: String?,
    val occupation: String?,
    val age: Int?,
    val clientType: String?,
    val comment: String?,
    val source: String?,
    val city: String?,
    val state: String?
)

data class BankDetail(
    val id: Int,
    val clientId: Int,
    val bankName: String?,
    val accountNumber: String?,
    val ifseCode: String?,
    val micrCode: String?,
    val familyCode: String?,
    val persCode: String?,
    val aadhar: String?,
    val pan: String?,
    val ckyc: String?
)

data class Document(
    val id: Int,
    val clientId: Int,
    val policyNo: Int?,
    val title: String?,
    val photo: String?,
    val profile: Boolean?
)

data class ClientDetail(
    val id: Int,
    val familyCode: String,
    val persCode: String?,
    val name: String?,
    val mobile: String?,
    val dob: String?,
    val sex: String?,
    val address: String?,
    val email: String?,
    val occupation: String?,
    val age: Int?,
    val clientType: String?,
    val comment: String?,
    val source: String?,
    val city: String?,
    val state: String?,
    val policies: List<PolicyListItem>?,
    val bankDetails: List<BankDetail>?,
    val documents: List<Document>?
)

data class ClientsResponse(val data: List<Client>, val total: Int, val page: Int, val limit: Int)

data class CreateClientRequest(
    val familyCode: String,
    val persCode: String,
    val name: String,
    val dob: String? = null,
    val sex: String? = null,
    val mobile: String? = null,
    val email: String? = null,
    val occupation: String? = null,
    val clientType: String? = null,
    val address: String? = null
)

data class UpdateClientRequest(
    val familyCode: String? = null,
    val persCode: String? = null,
    val name: String? = null,
    val dob: String? = null,
    val sex: String? = null,
    val mobile: String? = null,
    val email: String? = null,
    val occupation: String? = null,
    val clientType: String? = null,
    val address: String? = null
)

// ---------- Plans ----------

data class Plan(
    val planNo: String,
    val planName: String?,
    val sbSchedule: List<Double>?,
    val lapsDays: Int?,
    val gstRates: List<Double>?
)

data class PlansResponse(val data: List<Plan>)

// ---------- FUP ----------

data class FUPDueItem(
    val policyNo: Int,
    val clientName: String,
    val mobile: String?,
    val planName: String?,
    val premium: Double,
    val nextPremium: String?,
    val paymentMode: String?,
    val daysOverdue: Int,
    val lapseDate: String?,
    val daysUntilLapse: Int
)

data class FUPResponse(val data: List<FUPDueItem>, val total: Int, val page: Int, val limit: Int)

data class FUPUpdateRequest(
    val policyNo: Int,
    val oldFup: String,
    val newFup: String,
    val reason: String? = null
)

data class FUPHistoryResponse(val data: List<FUPHistory>)

data class FUPMultipleDueItem(
    val instalmentNo: Int?,
    val dueDate: String?,
    val amount: Double?
)

data class FUPMultipleDueResponse(val data: List<FUPMultipleDueItem>)

// ---------- Commission ----------

data class Commission(
    val id: String,
    val policyNo: Int,
    val billDate: String?,
    val firstComm: Double,
    val secondComm: Double,
    val thirdComm: Double,
    val bonusComm: Double,
    val singleComm: Double,
    val subComm: Double,
    val payDate: String?
)

data class CommissionResponse(val data: List<Commission>, val total: Int?, val page: Int?, val limit: Int?)

data class CommissionMonthSummary(val month: String, val totalCommission: Double, val policiesBilled: Int)

data class CommissionYearlySummary(val year: Int, val firstYear: Double, val renewal: Double, val bonus: Double, val gross: Double)

data class CommissionSummaryResponse(val currentMonth: CommissionMonthSummary, val yearly: List<CommissionYearlySummary>)

data class CommissionCalculation(
    val policyNo: Int?,
    val year: Int?,
    val baseCommissionPct: Double?,
    val bonusCommissionPct: Double?,
    val totalPct: Double?,
    val estimatedCommission: Double?,
    val note: String?
)

data class CreateCommissionRequest(
    val policyNo: Int,
    val billDate: String,
    val firstComm: Double? = null,
    val secondComm: Double? = null,
    val thirdComm: Double? = null,
    val bonusComm: Double? = null,
    val singleComm: Double? = null,
    val payDate: String? = null
)

// ---------- Loans ----------

data class Loan(
    val id: Int,
    val policyNo: Int,
    val loanDate: String?,
    val loanAmount: Int,
    val interestDueDate: String?,
    val loanInterest: Int?,
    val details: String?
)

data class LoansResponse(val data: List<Loan>)

data class CreateLoanRequest(val policyNo: Int, val loanDate: String, val loanAmount: Int, val interestDueDate: String)

// ---------- SB ----------

data class SBItem(
    val id: String,
    val policyNo: Int,
    val clientName: String,
    val sbDueDate: String,
    val sbPayDate: String?,
    val sbAmount: Double,
    val instalmentNo: Int
)

data class SBResponse(val data: List<SBItem>)

data class CreateSBRequest(val policyNo: Int, val sbDueDate: String, val sbAmount: Double, val instalmentNo: Int)

data class MarkSBPaidRequest(val paidDate: String, val chequeNo: String? = null)

// ---------- Leads ----------

data class Lead(
    val id: String,
    val name: String,
    val mobile: String?,
    val address: String?,
    val searchTerm: String?,
    val createdAt: String
)

data class LeadsResponse(val data: List<Lead>)

data class CreateLeadRequest(
    val name: String,
    val mobile: String,
    val address: String? = null,
    val searchTerm: String? = null
)

// ---------- Activities ----------

data class Activity(
    val id: String,
    val policyNo: Int?,
    val activityType: String?,
    val details: String?,
    val activityDate: String?,
    val status: String?
)

data class ActivitiesResponse(val data: List<Activity>)

data class CreateActivityRequest(
    val clientId: Int,
    val policyNo: Int? = null,
    val activityType: String,
    val activityDate: String,
    val activityTime: String? = null,
    val details: String? = null,
    val reminderDate: String? = null,
    val reminderTime: String? = null,
    val status: String? = null
)

data class UpdateActivityRequest(val status: String)

// ---------- GST ----------

data class GSTCalculation(
    val policyNo: Int?,
    val planNo: String?,
    val planType: String?,
    val basePremium: Double,
    val premiumYear: Int?,
    val gstRate: Double,
    val gstAmount: Double,
    val totalPremium: Double,
    val regulation: String?,
    val historicalNote: String?
)

// ---------- Reports ----------

data class CashInOutItem(val month: String, val income: Double, val expense: Double, val net: Double)

data class CashInOutResponse(val data: List<CashInOutItem>)

data class CashflowItem(
    val policyNo: Int?,
    val date: String?,
    val type: String?,
    val amount: Double?
)

data class CashflowReportResponse(val data: List<CashflowItem>)

data class StatusReportItem(
    val policyNo: Int?,
    val status: String?,
    val fupStatus: String?
)

data class StatusReportResponse(val data: List<StatusReportItem>)

data class CalendarReportItem(
    val policyNo: Int?,
    val months: List<String>?
)

data class CalendarReportResponse(val data: List<CalendarReportItem>)

data class RefreshReportsRequest(val familyCode: String)
