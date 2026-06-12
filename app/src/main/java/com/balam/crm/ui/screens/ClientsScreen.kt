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
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Person
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
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.balam.crm.data.model.Client
import com.balam.crm.data.model.CreateClientRequest
import com.balam.crm.ui.components.EmptyState
import com.balam.crm.ui.components.ErrorState
import com.balam.crm.ui.components.LoadingState
import com.balam.crm.ui.components.SearchField
import com.balam.crm.viewmodel.ClientsViewModel
import com.balam.crm.viewmodel.UiState
import kotlinx.coroutines.delay

@Composable
fun ClientsScreen(
    onBack: () -> Unit,
    onClientClick: (Int) -> Unit,
    viewModel: ClientsViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val createState by viewModel.createState.collectAsStateWithLifecycle()
    var query by rememberSaveable { mutableStateOf("") }
    var showCreateDialog by rememberSaveable { mutableStateOf(false) }

    LaunchedEffect(query) {
        if (query.isNotEmpty()) delay(400)
        viewModel.load(search = query)
    }

    LaunchedEffect(createState) {
        if (createState is UiState.Success) {
            showCreateDialog = false
            viewModel.resetCreateState()
            viewModel.load(search = query)
        }
    }

    Scaffold(
        topBar = { BackTopBar(title = "Clients", onBack = onBack) },
        floatingActionButton = {
            FloatingActionButton(onClick = { showCreateDialog = true }) {
                Icon(Icons.Filled.Add, contentDescription = "Add client")
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
                placeholder = "Search clients…"
            )
            Spacer(Modifier.height(4.dp))

            when (val s = state) {
                is UiState.Loading -> LoadingState()
                is UiState.Error -> ErrorState(message = s.message, onRetry = { viewModel.load(query) })
                is UiState.Success -> {
                    val clients = s.data.data
                    if (clients.isEmpty()) {
                        EmptyState(icon = Icons.Filled.Person, message = "No clients found")
                    } else {
                        LazyColumn(
                            modifier = Modifier.fillMaxSize(),
                            contentPadding = PaddingValues(top = 8.dp, bottom = 88.dp),
                            verticalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            items(clients, key = { it.id }) { client ->
                                ClientCard(client = client, onClick = { onClientClick(client.id) })
                            }
                        }
                    }
                }
            }
        }
    }

    if (showCreateDialog) {
        CreateClientDialog(
            createState = createState,
            onDismiss = {
                showCreateDialog = false
                viewModel.resetCreateState()
            },
            onSubmit = { viewModel.createClient(it) }
        )
    }
}

@Composable
private fun ClientCard(client: Client, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                Icons.Filled.Person,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary
            )
            Column(modifier = Modifier.weight(1f).padding(start = 12.dp)) {
                Text(
                    text = client.name,
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold
                )
                Spacer(Modifier.height(2.dp))
                Text(
                    text = listOfNotNull(
                        client.familyCode,
                        client.age?.let { "$it yrs" },
                        client.mobile
                    ).joinToString(" · ").ifBlank { "—" },
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                if (!client.occupation.isNullOrBlank()) {
                    Text(
                        text = client.occupation,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
            Icon(
                Icons.Filled.ChevronRight,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.outline
            )
        }
    }
}

@Composable
private fun CreateClientDialog(
    createState: UiState<*>?,
    onDismiss: () -> Unit,
    onSubmit: (CreateClientRequest) -> Unit
) {
    var familyCode by remember { mutableStateOf("") }
    var persCode by remember { mutableStateOf("") }
    var name by remember { mutableStateOf("") }
    var mobile by remember { mutableStateOf("") }
    var dob by remember { mutableStateOf("") }
    var occupation by remember { mutableStateOf("") }
    val isLoading = createState is UiState.Loading
    val errorMessage = (createState as? UiState.Error)?.message

    AlertDialog(
        onDismissRequest = { if (!isLoading) onDismiss() },
        title = { Text("New Client") },
        text = {
            Column(modifier = Modifier.verticalScroll(rememberScrollState())) {
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
                    label = { Text("Mobile") },
                    singleLine = true,
                    enabled = !isLoading
                )
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = dob,
                    onValueChange = { dob = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("DOB (YYYY-MM-DD)") },
                    singleLine = true,
                    enabled = !isLoading
                )
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = occupation,
                    onValueChange = { occupation = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Occupation") },
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
                        CreateClientRequest(
                            familyCode = familyCode.trim(),
                            persCode = persCode.trim(),
                            name = name.trim(),
                            mobile = mobile.trim().takeIf { it.isNotBlank() },
                            dob = dob.trim().takeIf { it.isNotBlank() },
                            occupation = occupation.trim().takeIf { it.isNotBlank() }
                        )
                    )
                },
                enabled = familyCode.isNotBlank() && persCode.isNotBlank() && name.isNotBlank() && !isLoading
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
