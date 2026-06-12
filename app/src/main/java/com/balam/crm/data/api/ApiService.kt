package com.balam.crm.data.api

import com.balam.crm.data.model.*
import okhttp3.MultipartBody
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Part
import retrofit2.http.Path
import retrofit2.http.Query

interface ApiService {

    // Auth
    @POST("auth/login")
    suspend fun login(@Body body: LoginRequest): AuthResponse

    @GET("auth/me")
    suspend fun me(): Agent

    @POST("auth/register")
    suspend fun register(@Body body: RegisterRequest): MessageResponse

    @POST("auth/change-password")
    suspend fun changePassword(@Body body: ChangePasswordRequest): MessageResponse

    @POST("auth/refresh")
    suspend fun refreshToken(): AuthResponse

    @GET("agent/profile")
    suspend fun getProfile(): Agent

    @PUT("agent/profile")
    suspend fun updateProfile(@Body body: UpdateProfileRequest): Agent

    @Multipart
    @POST("agent/import")
    suspend fun importAgentData(@Part file: MultipartBody.Part): MessageResponse

    // Policies
    @GET("policies")
    suspend fun getPolicies(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
        @Query("search") search: String? = null,
        @Query("status") status: String? = null
    ): PoliciesResponse

    @POST("policies")
    suspend fun createPolicy(@Body body: CreatePolicyRequest): MessageResponse

    @GET("policies/{policyNo}")
    suspend fun getPolicy(@Path("policyNo") policyNo: Int): PolicyDetail

    @PUT("policies/{policyNo}")
    suspend fun updatePolicy(@Path("policyNo") policyNo: Int, @Body body: UpdatePolicyRequest): MessageResponse

    // Families
    @GET("families")
    suspend fun getFamilies(
        @Query("search") search: String? = null,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20
    ): FamiliesResponse

    @POST("families")
    suspend fun createFamily(@Body body: CreateFamilyRequest): CreateFamilyResponse

    @GET("families/{familyCode}")
    suspend fun getFamily(@Path("familyCode") familyCode: String): FamilyDetail

    @PUT("families/{familyCode}")
    suspend fun updateFamily(@Path("familyCode") familyCode: String, @Body body: UpdateFamilyRequest): MessageResponse

    // Clients
    @GET("clients")
    suspend fun getClients(
        @Query("search") search: String? = null,
        @Query("familyCode") familyCode: String? = null,
        @Query("clientType") clientType: String? = null,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20
    ): ClientsResponse

    @POST("clients")
    suspend fun createClient(@Body body: CreateClientRequest): Client

    @GET("clients/search")
    suspend fun searchClients(
        @Query("q") q: String,
        @Query("limit") limit: Int? = null
    ): ClientsResponse

    @GET("clients/{id}")
    suspend fun getClient(@Path("id") id: Int): ClientDetail

    @PUT("clients/{id}")
    suspend fun updateClient(@Path("id") id: Int, @Body body: UpdateClientRequest): Client

    // Plans
    @GET("plans")
    suspend fun getPlans(): PlansResponse

    // FUP
    @GET("fup/due")
    suspend fun getFupDue(
        @Query("year") year: Int? = null,
        @Query("month") month: Int? = null,
        @Query("overdueDays") overdueDays: Int? = null
    ): FUPResponse

    @POST("fup/update")
    suspend fun updateFup(@Body body: FUPUpdateRequest): MessageResponse

    @GET("fup/history/{policyNo}")
    suspend fun getFupHistory(@Path("policyNo") policyNo: Int): FUPHistoryResponse

    @GET("fup/multipledue/{policyNo}")
    suspend fun getFupMultipleDue(@Path("policyNo") policyNo: Int): FUPMultipleDueResponse

    // Commission
    @GET("commission")
    suspend fun getCommission(
        @Query("year") year: Int? = null,
        @Query("month") month: Int? = null
    ): CommissionResponse

    @POST("commission")
    suspend fun createCommission(@Body body: CreateCommissionRequest): Commission

    @GET("commission/summary")
    suspend fun getCommissionSummary(): CommissionSummaryResponse

    @GET("commission/calculate")
    suspend fun calculateCommission(
        @Query("policyNo") policyNo: Int,
        @Query("year") year: Int
    ): CommissionCalculation

    // Loans
    @GET("loans")
    suspend fun getLoans(@Query("policyNo") policyNo: Int? = null): LoansResponse

    @POST("loans")
    suspend fun createLoan(@Body body: CreateLoanRequest): Loan

    // SB
    @GET("sb")
    suspend fun getSB(
        @Query("year") year: Int? = null,
        @Query("month") month: Int? = null,
        @Query("unpaidOnly") unpaidOnly: Boolean? = null
    ): SBResponse

    @POST("sb")
    suspend fun createSB(@Body body: CreateSBRequest): SBItem

    @PUT("sb/{id}/mark-paid")
    suspend fun markSBPaid(@Path("id") id: Int, @Body body: MarkSBPaidRequest): SBItem

    // Leads
    @GET("leads")
    suspend fun getLeads(@Query("search") search: String? = null): LeadsResponse

    @POST("leads")
    suspend fun createLead(@Body body: CreateLeadRequest): Lead

    @PUT("leads/{id}")
    suspend fun updateLead(@Path("id") id: Int, @Body body: CreateLeadRequest): Lead

    // Activities
    @GET("activities")
    suspend fun getActivities(
        @Query("clientId") clientId: Int? = null
    ): ActivitiesResponse

    @GET("activities/today")
    suspend fun getTodayActivities(): ActivitiesResponse

    @POST("activities")
    suspend fun createActivity(@Body body: CreateActivityRequest): Activity

    @PUT("activities/{id}")
    suspend fun updateActivity(@Path("id") id: Int, @Body body: UpdateActivityRequest): Activity

    // GST
    @GET("gst/calculate")
    suspend fun calculateGST(@Query("policyNo") policyNo: Int): GSTCalculation

    // Reports
    @GET("reports/cashinout")
    suspend fun getCashInOut(): CashInOutResponse

    @GET("reports/cashflow")
    suspend fun getCashflowReport(@Query("familyCode") familyCode: String): CashflowReportResponse

    @GET("reports/status")
    suspend fun getStatusReport(@Query("familyCode") familyCode: String): StatusReportResponse

    @GET("reports/calendar")
    suspend fun getCalendarReport(@Query("familyCode") familyCode: String): CalendarReportResponse

    @POST("reports/refresh")
    suspend fun refreshReports(@Body body: RefreshReportsRequest): MessageResponse
}
