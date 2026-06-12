package com.balam.crm.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.PersonAdd
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
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
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.balam.crm.data.model.CreateLeadRequest
import com.balam.crm.data.model.Lead
import com.balam.crm.ui.components.EmptyState
import com.balam.crm.ui.components.ErrorState
import com.balam.crm.ui.components.LoadingState
import com.balam.crm.ui.components.SearchField
import com.balam.crm.viewmodel.LeadsViewModel
import com.balam.crm.viewmodel.UiState
import kotlinx.coroutines.delay

@Composable
fun LeadsScreen(
    onBack: () -> Unit,
    viewModel: LeadsViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val saveState by viewModel.saveState.collectAsStateWithLifecycle()
    var query by rememberSaveable { mutableStateOf("") }
    var showCreateDialog by rememberSaveable { mutableStateOf(false) }
    var editLead by remember { mutableStateOf<Lead?>(null) }

    LaunchedEffect(query) {
        if (query.isNotEmpty()) delay(400)
        viewModel.load(search = query)
    }

    LaunchedEffect(saveState) {
        if (saveState is UiState.Success) {
            showCreateDialog = false
            editLead = null
            viewModel.resetSaveState()
            viewModel.load(search = query)
        }
    }

    Scaffold(
        topBar = { BackTopBar(title = "Leads", onBack = onBack) },
        floatingActionButton = {
            FloatingActionButton(onClick = { showCreateDialog = true }) {
                Icon(Icons.Filled.Add, contentDescription = "Add lead")
            }
        },
        containerColor = MaterialTheme.colorScheme.background
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp)
        ) {
            SearchField(
                value = query,
                onValueChange = { query = it },
                placeholder = "Search leads…"
            )
            Spacer(Modifier.height(4.dp))

            when (val s = state) {
                is UiState.Loading -> LoadingState()
                is UiState.Error -> ErrorState(message = s.message, onRetry = { viewModel.load(query) })
                is UiState.Success -> {
                    val leads = s.data.data
                    if (leads.isEmpty()) {
                        EmptyState(icon = Icons.Filled.PersonAdd, message = "No leads yet. Add your first prospect!")
                    } else {
                        LazyColumn(
                            modifier = Modifier.fillMaxSize(),
                            contentPadding = PaddingValues(top = 8.dp, bottom = 88.dp),
                            verticalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            items(leads, key = { it.id }) { lead ->
                                LeadCard(lead = lead, onClick = { editLead = lead })
                            }
                        }
                    }
                }
            }
        }
    }

    if (showCreateDialog || editLead != null) {
        LeadDialog(
            lead = editLead,
            saveState = saveState,
            onDismiss = {
                showCreateDialog = false
                editLead = null
                viewModel.resetSaveState()
            },
            onSubmit = { request ->
                val existing = editLead
                if (existing != null) {
                    viewModel.update(existing.id.toIntOrNull() ?: 0, request)
                } else {
                    viewModel.create(request)
                }
            }
        )
    }
}

@Composable
private fun LeadCard(lead: Lead, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = lead.name,
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold
            )
            Spacer(Modifier.height(2.dp))
            Text(
                text = listOfNotNull(lead.mobile, lead.address).joinToString(" · ").ifBlank { "No contact details" },
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(Modifier.height(4.dp))
            Text(
                text = "Added ${formatDate(lead.createdAt)}" +
                    (lead.searchTerm?.takeIf { it.isNotBlank() }?.let { " · $it" } ?: ""),
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
private fun LeadDialog(
    lead: Lead?,
    saveState: UiState<*>?,
    onDismiss: () -> Unit,
    onSubmit: (CreateLeadRequest) -> Unit
) {
    var name by remember { mutableStateOf(lead?.name ?: "") }
    var mobile by remember { mutableStateOf(lead?.mobile ?: "") }
    var address by remember { mutableStateOf(lead?.address ?: "") }
    var searchTerm by remember { mutableStateOf(lead?.searchTerm ?: "") }
    val isLoading = saveState is UiState.Loading
    val errorMessage = (saveState as? UiState.Error)?.message

    AlertDialog(
        onDismissRequest = { if (!isLoading) onDismiss() },
        title = { Text(if (lead == null) "New Lead" else "Edit Lead") },
        text = {
            Column(modifier = Modifier.verticalScroll(rememberScrollState())) {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Name *") },
                    singleLine = true,
                    enabled = !isLoading
                )
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = mobile,
                    onValueChange = { mobile = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Mobile *") },
                    singleLine = true,
                    enabled = !isLoading
                )
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = address,
                    onValueChange = { address = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Address") },
                    enabled = !isLoading
                )
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = searchTerm,
                    onValueChange = { searchTerm = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Tag / Search Term") },
                    singleLine = true,
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
                        CreateLeadRequest(
                            name = name.trim(),
                            mobile = mobile.trim(),
                            address = address.trim().takeIf { it.isNotBlank() },
                            searchTerm = searchTerm.trim().takeIf { it.isNotBlank() }
                        )
                    )
                },
                enabled = name.isNotBlank() && mobile.trim().isNotBlank() && !isLoading
            ) {
                if (isLoading) {
                    CircularProgressIndicator(modifier = Modifier.size(18.dp), strokeWidth = 2.dp)
                } else {
                    Text(if (lead == null) "Create" else "Save")
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
