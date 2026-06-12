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
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.balam.crm.data.model.CashInOutItem
import com.balam.crm.ui.components.EmptyState
import com.balam.crm.ui.components.ErrorState
import com.balam.crm.ui.components.LoadingState
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
                if (rows.isEmpty()) {
                    EmptyState(
                        icon = Icons.Filled.Assessment,
                        message = "No report data available",
                        modifier = Modifier.padding(padding)
                    )
                } else {
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(padding),
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
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
