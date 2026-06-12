package com.balam.crm.data.api

import com.balam.crm.data.model.*
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
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

    @PUT("auth/profile")
    suspend fun updateProfile(@Body body: UpdateProfileRequest): Agent

    // Policies
    @GET("policies")
    suspend fun getPolicies(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
        @Query("search") search: String? = null,
        @Query("status") status: String? = null
    ): PoliciesResponse

    @GET("policies/{policyNo}")
    suspend fun getPolicy(@Path("policyNo") policyNo: Int): PolicyDetail

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
    suspend fun updateFamily(@Path("familyCode") familyCode: String, @Body body: CreateFamilyRequest): MessageResponse

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

    @GET("clients/{id}")
    suspend fun getClient(@Path("id") id: Int): ClientDetail

    @PUT("clients/{id}")
    suspend fun updateClient(@Path("id") id: Int, @Body body: CreateClientRequest): Client

    // FUP
    @GET("fup/due")
    suspend fun getFupDue(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20
    ): FUPResponse

    @POST("fup/update")
    suspend fun updateFup(@Body body: FUPUpdateRequest): MessageResponse

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

    @PUT("sb/{id}/paid")
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
        @Query("type") type: String? = null,
        @Query("status") status: String? = null
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
}
