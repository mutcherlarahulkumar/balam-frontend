package com.balam.crm.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Description
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.MenuAnchorType
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.compose.foundation.text.KeyboardOptions
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.balam.crm.data.model.CreatePolicyRequest
import com.balam.crm.data.model.Plan
import com.balam.crm.data.model.PolicyListItem
import com.balam.crm.ui.components.EmptyState
import com.balam.crm.ui.components.ErrorState
import com.balam.crm.ui.components.FupBadge
import com.balam.crm.ui.components.LoadingState
import com.balam.crm.ui.components.SearchField
import com.balam.crm.ui.components.StatusBadge
import com.balam.crm.ui.components.formatINR
import com.balam.crm.viewmodel.PoliciesViewModel
import com.balam.crm.viewmodel.UiState
import kotlinx.coroutines.delay

private val statusFilters = listOf(
    null to "All",
    "IF" to "In Force",
    "LA" to "Lapsed",
    "PU" to "Paid Up",
    "MA" to "Matured"
)

@Composable
fun PoliciesScreen(
    onPolicyClick: (Int) -> Unit,
    viewModel: PoliciesViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val createState by viewModel.createState.collectAsStateWithLifecycle()
    val plans by viewModel.plans.collectAsStateWithLifecycle()
    var query by rememberSaveable { mutableStateOf("") }
    var status by rememberSaveable { mutableStateOf<String?>(null) }
    var showCreateDialog by rememberSaveable { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        viewModel.loadPlans()
    }

    LaunchedEffect(query, status) {
        if (query.isNotEmpty()) delay(400)
        viewModel.load(search = query, status = status)
    }

    LaunchedEffect(createState) {
        if (createState is UiState.Success) {
            showCreateDialog = false
            viewModel.resetCreateState()
            viewModel.load(search = query, status = status)
        }
    }

    if (showCreateDialog) {
        CreatePolicyDialog(
            createState = createState,
            plans = plans,
            onDismiss = {
                showCreateDialog = false
                viewModel.resetCreateState()
            },
            onSubmit = { viewModel.createPolicy(it) }
        )
    }

    Scaffold(
        floatingActionButton = {
            FloatingActionButton(onClick = { showCreateDialog = true }) {
                Icon(Icons.Filled.Add, contentDescription = "Add policy")
            }
        },
        containerColor = MaterialTheme.colorScheme.background
    ) { padding ->
    Column(
        modifier = Modifier
            .fillMaxSize()
            .statusBarsPadding()
            .padding(padding)
            .padding(horizontal = 16.dp)
    ) {
        Spacer(Modifier.height(16.dp))
        Text(
            text = "Policies",
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold
        )
        Spacer(Modifier.height(12.dp))
        SearchField(
            value = query,
            onValueChange = { query = it },
            placeholder = "Search by policy no, client name…"
        )
        Spacer(Modifier.height(8.dp))
        Row(
            modifier = Modifier.horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            statusFilters.forEach { (code, label) ->
                FilterChip(
                    selected = status == code,
                    onClick = { status = code },
                    label = { Text(label) }
                )
            }
        }
        Spacer(Modifier.height(4.dp))

        when (val s = state) {
            is UiState.Loading -> LoadingState()
            is UiState.Error -> ErrorState(message = s.message, onRetry = { viewModel.load(query, status) })
            is UiState.Success -> {
                val policies = s.data.data
                if (policies.isEmpty()) {
                    EmptyState(icon = Icons.Filled.Description, message = "No policies found")
                } else {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(top = 8.dp, bottom = 88.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        items(policies, key = { it.id }) { policy ->
                            PolicyCard(policy = policy, onClick = { onPolicyClick(policy.policyNo) })
                        }
                    }
                }
            }
        }
    }
    }
}

@Composable
internal fun PolicyCard(policy: PolicyListItem, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = policy.clientName,
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.weight(1f)
                )
                StatusBadge(status = policy.status ?: "—")
            }
            Spacer(Modifier.height(4.dp))
            Text(
                text = "Policy ${policy.policyNo} · ${policy.planName ?: "Plan ${policy.planNo ?: "—"}"}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = formatINR(policy.premium),
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.SemiBold
                    )
                    Text(
                        text = "${policy.paymentMode ?: "—"} · next ${formatDate(policy.nextPremium)}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                FupBadge(fupStatus = policy.fupStatus ?: "—")
            }
        }
    }
}

/**
 * Plan picker. Uses an ExposedDropdownMenuBox with a free-text search filter when [plans]
 * is non-empty; otherwise falls back to a plain editable text field so a planNo can still
 * be entered manually (offline / load failure).
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
internal fun PlanPickerField(
    planNo: String,
    onPlanNoChange: (String) -> Unit,
    plans: List<Plan>,
    enabled: Boolean
) {
    if (plans.isEmpty()) {
        OutlinedTextField(
            value = planNo,
            onValueChange = onPlanNoChange,
            modifier = Modifier.fillMaxWidth(),
            label = { Text("Plan No *") },
            singleLine = true,
            enabled = enabled
        )
        return
    }

    var expanded by remember { mutableStateOf(false) }
    val filtered = remember(planNo, plans) {
        if (planNo.isBlank()) plans
        else plans.filter {
            it.planNo.contains(planNo, ignoreCase = true) ||
                (it.planName?.contains(planNo, ignoreCase = true) == true)
        }
    }

    ExposedDropdownMenuBox(
        expanded = expanded,
        onExpandedChange = { if (enabled) expanded = it }
    ) {
        OutlinedTextField(
            value = planNo,
            onValueChange = {
                onPlanNoChange(it)
                expanded = true
            },
            modifier = Modifier
                .fillMaxWidth()
                .menuAnchor(MenuAnchorType.PrimaryEditable),
            label = { Text("Plan No *") },
            placeholder = { Text("Search plan no or name") },
            singleLine = true,
            enabled = enabled,
            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) }
        )
        ExposedDropdownMenu(
            expanded = expanded,
            onDismissRequest = { expanded = false },
            modifier = Modifier.heightIn(max = 280.dp)
        ) {
            filtered.forEach { plan ->
                DropdownMenuItem(
                    text = {
                        Text(
                            listOfNotNull(plan.planNo, plan.planName)
                                .joinToString(" — ")
                        )
                    },
                    onClick = {
                        onPlanNoChange(plan.planNo)
                        expanded = false
                    }
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun CreatePolicyDialog(
    createState: UiState<*>?,
    plans: List<Plan>,
    onDismiss: () -> Unit,
    onSubmit: (CreatePolicyRequest) -> Unit
) {
    var policyNo by remember { mutableStateOf("") }
    var familyCode by remember { mutableStateOf("") }
    var persCode by remember { mutableStateOf("") }
    var planNo by remember { mutableStateOf("") }
    var issueDate by remember { mutableStateOf("") }
    var matDate by remember { mutableStateOf("") }
    var term by remember { mutableStateOf("") }
    var ppt by remember { mutableStateOf("") }
    var sumAssured by remember { mutableStateOf("") }
    var premium by remember { mutableStateOf("") }
    var paymentMode by remember { mutableStateOf("") }
    var nextPremium by remember { mutableStateOf("") }
    var nominee by remember { mutableStateOf("") }
    var relation by remember { mutableStateOf("") }
    var branch by remember { mutableStateOf("") }
    var neft by remember { mutableStateOf("") }
    var dab by remember { mutableStateOf("") }
    var termRider by remember { mutableStateOf("") }

    val isLoading = createState is UiState.Loading
    val errorMessage = (createState as? UiState.Error)?.message

    val isValid = policyNo.toIntOrNull() != null &&
        familyCode.isNotBlank() &&
        persCode.isNotBlank() &&
        planNo.isNotBlank() &&
        issueDate.isNotBlank() &&
        matDate.isNotBlank() &&
        term.toIntOrNull() != null &&
        ppt.toIntOrNull() != null &&
        sumAssured.toDoubleOrNull() != null &&
        premium.toDoubleOrNull() != null &&
        paymentMode.isNotBlank() &&
        nextPremium.isNotBlank() &&
        nominee.isNotBlank() &&
        relation.isNotBlank()

    AlertDialog(
        onDismissRequest = { if (!isLoading) onDismiss() },
        title = { Text("New Policy") },
        text = {
            Column(modifier = Modifier.verticalScroll(rememberScrollState()).imePadding()) {
                OutlinedTextField(
                    value = policyNo,
                    onValueChange = { policyNo = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Policy No *") },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    enabled = !isLoading
                )
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = familyCode,
                    onValueChange = { familyCode = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Family Code *") },
                    singleLine = true,
                    enabled = !isLoading
                )
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = persCode,
                    onValueChange = { persCode = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Person Code *") },
                    singleLine = true,
                    enabled = !isLoading
                )
                Spacer(Modifier.height(8.dp))
                PlanPickerField(
                    planNo = planNo,
                    onPlanNoChange = { planNo = it },
                    plans = plans,
                    enabled = !isLoading
                )
                Spacer(Modifier.height(8.dp))
                com.balam.crm.ui.components.DateField(
                    value = issueDate,
                    onValueChange = { issueDate = it },
                    label = "Issue Date *",
                    enabled = !isLoading
                )
                Spacer(Modifier.height(8.dp))
                com.balam.crm.ui.components.DateField(
                    value = matDate,
                    onValueChange = { matDate = it },
                    label = "Maturity Date *",
                    enabled = !isLoading
                )
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = term,
                    onValueChange = { term = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Term *") },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    enabled = !isLoading
                )
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = ppt,
                    onValueChange = { ppt = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("PPT *") },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    enabled = !isLoading
                )
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = sumAssured,
                    onValueChange = { sumAssured = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Sum Assured *") },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    enabled = !isLoading
                )
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = premium,
                    onValueChange = { premium = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Premium *") },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    enabled = !isLoading
                )
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = paymentMode,
                    onValueChange = { paymentMode = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Payment Mode *") },
                    placeholder = { Text("Y/H/Q/M/S") },
                    singleLine = true,
                    enabled = !isLoading
                )
                Spacer(Modifier.height(8.dp))
                com.balam.crm.ui.components.DateField(
                    value = nextPremium,
                    onValueChange = { nextPremium = it },
                    label = "Next Premium *",
                    enabled = !isLoading
                )
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = nominee,
                    onValueChange = { nominee = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Nominee *") },
                    singleLine = true,
                    enabled = !isLoading
                )
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = relation,
                    onValueChange = { relation = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Relation *") },
                    singleLine = true,
                    enabled = !isLoading
                )
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = branch,
                    onValueChange = { branch = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Branch") },
                    singleLine = true,
                    enabled = !isLoading
                )
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = neft,
                    onValueChange = { neft = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("NEFT") },
                    singleLine = true,
                    enabled = !isLoading
                )
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = dab,
                    onValueChange = { dab = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("DAB") },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    enabled = !isLoading
                )
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = termRider,
                    onValueChange = { termRider = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Term Rider") },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    enabled = !isLoading
                )
                if (errorMessage != null) {
                    Spacer(Modifier.height(8.dp))
                    Text(
                        text = errorMessage,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.error
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    onSubmit(
                        CreatePolicyRequest(
                            policyNo = policyNo.trim().toInt(),
                            familyCode = familyCode.trim(),
                            persCode = persCode.trim(),
                            planNo = planNo.trim(),
                            issueDate = issueDate.trim(),
                            matDate = matDate.trim(),
                            term = term.trim().toInt(),
                            ppt = ppt.trim().toInt(),
                            sumAssured = sumAssured.trim().toDouble(),
                            premium = premium.trim().toDouble(),
                            paymentMode = paymentMode.trim(),
                            nextPremium = nextPremium.trim(),
                            nominee = nominee.trim(),
                            relation = relation.trim(),
                            branch = branch.trim().takeIf { it.isNotBlank() },
                            neft = neft.trim().takeIf { it.isNotBlank() },
                            dab = dab.trim().toIntOrNull(),
                            termRider = termRider.trim().toIntOrNull()
                        )
                    )
                },
                enabled = isValid && !isLoading
            ) {
                if (isLoading) {
                    CircularProgressIndicator(modifier = Modifier.size(18.dp), strokeWidth = 2.dp)
                } else {
                    Text("Create")
                }
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss, enabled = !isLoading) {
                Text("Cancel")
            }
        }
    )
}
