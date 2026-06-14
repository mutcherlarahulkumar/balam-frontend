package com.balam.crm.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Assessment
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.balam.crm.data.model.CalendarReportItem
import com.balam.crm.data.model.CashInOutItem
import com.balam.crm.data.model.CashflowItem
import com.balam.crm.data.model.StatusReportItem
import com.balam.crm.ui.components.EmptyState
import com.balam.crm.ui.components.ErrorState
import com.balam.crm.ui.components.FupBadge
import com.balam.crm.ui.components.LoadingState
import com.balam.crm.ui.components.SectionCard
import com.balam.crm.ui.components.StatusBadge
import com.balam.crm.ui.components.formatINR
import com.balam.crm.ui.theme.DangerRed
import com.balam.crm.ui.theme.SuccessGreen
import com.balam.crm.viewmodel.ReportsViewModel
import com.balam.crm.viewmodel.UiState

@Composable
fun ReportsScreen(
    onBack: () -> Unit,
    viewModel: ReportsViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val cashflowState by viewModel.cashflow.collectAsStateWithLifecycle()
    val statusState by viewModel.statusReport.collectAsStateWithLifecycle()
    val calendarState by viewModel.calendar.collectAsStateWithLifecycle()

    var familyCode by remember { mutableStateOf("") }
    var submittedFamilyCode by remember { mutableStateOf<String?>(null) }

    Scaffold(
        topBar = { BackTopBar(title = "Cash In / Out", onBack = onBack) },
        containerColor = MaterialTheme.colorScheme.background
    ) { padding ->
        when (val s = state) {
            is UiState.Loading -> LoadingState(modifier = Modifier.padding(padding))
            is UiState.Error -> ErrorState(
                message = s.message,
                onRetry = { viewModel.load() },
                modifier = Modifier.padding(padding)
            )
            is UiState.Success -> {
                val rows = s.data.data
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                        item {
                            Column {
                                OutlinedTextField(
                                    value = familyCode,
                                    onValueChange = { familyCode = it },
                                    label = { Text("Family Code") },
                                    modifier = Modifier.fillMaxWidth()
                                )
                                Spacer(Modifier.height(8.dp))
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Button(onClick = {
                                        submittedFamilyCode = familyCode
                                        viewModel.loadFamilyReports(familyCode)
                                    }) {
                                        Text("Load")
                                    }
                                    OutlinedButton(onClick = {
                                        submittedFamilyCode = familyCode
                                        viewModel.refresh(familyCode)
                                    }) {
                                        Text("Refresh cache")
                                    }
                                }
                                Spacer(Modifier.height(4.dp))
                                Text(
                                    text = "Refresh after editing policies or SB records for this family",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }

                        if (submittedFamilyCode != null) {
                            item {
                                SectionCard(title = "Cashflow") {
                                    when (val cf = cashflowState) {
                                        null, is UiState.Loading -> LoadingState()
                                        is UiState.Error -> ErrorState(message = cf.message, onRetry = {
                                            viewModel.loadFamilyReports(submittedFamilyCode!!)
                                        })
                                        is UiState.Success -> {
                                            val items = cf.data.data
                                            if (items.isEmpty()) {
                                                EmptyState(icon = Icons.Filled.Assessment, message = "No cashflow data")
                                            } else {
                                                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                                    items.forEach { CashflowRow(it) }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            item {
                                SectionCard(title = "Status") {
                                    when (val st = statusState) {
                                        null, is UiState.Loading -> LoadingState()
                                        is UiState.Error -> ErrorState(message = st.message, onRetry = {
                                            viewModel.loadFamilyReports(submittedFamilyCode!!)
                                        })
                                        is UiState.Success -> {
                                            val items = st.data.data
                                            if (items.isEmpty()) {
                                                EmptyState(icon = Icons.Filled.Assessment, message = "No status data")
                                            } else {
                                                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                                    items.forEach { StatusRow(it) }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            item {
                                SectionCard(title = "12-Month Premium Calendar") {
                                    when (val cal = calendarState) {
                                        null, is UiState.Loading -> LoadingState()
                                        is UiState.Error -> ErrorState(message = cal.message, onRetry = {
                                            viewModel.loadFamilyReports(submittedFamilyCode!!)
                                        })
                                        is UiState.Success -> {
                                            val items = cal.data.data
                                            if (items.isEmpty()) {
                                                EmptyState(icon = Icons.Filled.Assessment, message = "No calendar data")
                                            } else {
                                                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                                    items.forEach { item ->
                                                        Text(
                                                            text = "Policy ${item.policyNo}: ${item.months?.joinToString(", ") ?: ""}",
                                                            style = MaterialTheme.typography.bodySmall
                                                        )
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        if (rows.isEmpty()) {
                            item {
                                EmptyState(
                                    icon = Icons.Filled.Assessment,
                                    message = "No report data available"
                                )
                            }
                        } else {
                        item {
                            val totalNet = rows.sumOf { it.net }
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(16.dp),
                                colors = CardDefaults.cardColors(
                                    containerColor = MaterialTheme.colorScheme.primaryContainer
                                )
                            ) {
                                Column(modifier = Modifier.padding(20.dp)) {
                                    Text(
                                        text = "Net (all months)",
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = MaterialTheme.colorScheme.onPrimaryContainer
                                    )
                                    Spacer(Modifier.height(4.dp))
                                    Text(
                                        text = formatINR(totalNet),
                                        style = MaterialTheme.typography.headlineMedium,
                                        fontWeight = FontWeight.Bold,
                                        color = MaterialTheme.colorScheme.onPrimaryContainer
                                    )
                                }
                            }
                        }
                        items(rows, key = { it.month }) { row ->
                            CashRow(row = row)
                        }
                        }
                }
            }
        }
    }
}

@Composable
private fun CashRow(row: CashInOutItem) {
    Card(
        modifier = Modifier.fillMaxWidth(),
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
                    text = row.month,
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = formatINR(row.net),
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    color = if (row.net >= 0) SuccessGreen else DangerRed
                )
            }
            Spacer(Modifier.height(6.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "In: ${formatINR(row.income)}",
                    style = MaterialTheme.typography.bodySmall,
                    color = SuccessGreen
                )
                Text(
                    text = "Out: ${formatINR(row.expense)}",
                    style = MaterialTheme.typography.bodySmall,
                    color = DangerRed
                )
            }
        }
    }
}

@Composable
private fun CashflowRow(item: CashflowItem) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column {
            Text(
                text = item.date ?: "-",
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = item.type ?: "-",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
        Text(
            text = formatINR(item.amount ?: 0.0),
            style = MaterialTheme.typography.bodyMedium,
            fontWeight = FontWeight.Bold
        )
    }
}

@Composable
private fun StatusRow(item: StatusReportItem) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = "Policy ${item.policyNo}",
            style = MaterialTheme.typography.bodyMedium
        )
        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            item.status?.let { StatusBadge(status = it) }
            item.fupStatus?.let { FupBadge(fupStatus = it) }
        }
    }
}
