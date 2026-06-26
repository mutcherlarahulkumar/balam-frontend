package com.balam.crm.ui.screens

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
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Event
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
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.balam.crm.data.model.Activity
import com.balam.crm.data.model.CreateActivityRequest
import com.balam.crm.ui.components.AccentCard
import com.balam.crm.ui.components.Badge
import com.balam.crm.ui.components.EmptyState
import com.balam.crm.ui.components.ErrorState
import com.balam.crm.ui.components.LoadingState
import com.balam.crm.ui.components.SegmentedToggle
import com.balam.crm.ui.components.activityTypeColor
import com.balam.crm.ui.theme.SuccessGreen
import com.balam.crm.ui.theme.WarningOrange
import com.balam.crm.viewmodel.ActivitiesViewModel
import com.balam.crm.viewmodel.UiState
import java.util.Locale

@Composable
fun ActivitiesScreen(
    onBack: () -> Unit,
    viewModel: ActivitiesViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val actionState by viewModel.actionState.collectAsStateWithLifecycle()
    var todayOnly by rememberSaveable { mutableStateOf(true) }
    var showCreateDialog by rememberSaveable { mutableStateOf(false) }

    LaunchedEffect(todayOnly) {
        viewModel.load(todayOnly)
    }

    LaunchedEffect(actionState) {
        if (actionState is UiState.Success) {
            showCreateDialog = false
            viewModel.resetActionState()
            viewModel.load(todayOnly)
        }
    }

    Scaffold(
        topBar = { BackTopBar(title = "Activities", onBack = onBack) },
        floatingActionButton = {
            FloatingActionButton(onClick = { showCreateDialog = true }) {
                Icon(Icons.Filled.Add, contentDescription = "Add activity")
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
            SegmentedToggle(
                options = listOf(true to "Today", false to "All"),
                selected = todayOnly,
                onSelect = { todayOnly = it }
            )
            Spacer(Modifier.height(4.dp))

            when (val s = state) {
                is UiState.Loading -> LoadingState()
                is UiState.Error -> ErrorState(message = s.message, onRetry = { viewModel.load(todayOnly) })
                is UiState.Success -> {
                    val activities = s.data.data
                    if (activities.isEmpty()) {
                        EmptyState(
                            icon = Icons.Filled.Event,
                            message = if (todayOnly) "Nothing scheduled for today" else "No activities found"
                        )
                    } else {
                        LazyColumn(
                            modifier = Modifier.fillMaxSize(),
                            contentPadding = PaddingValues(top = 8.dp, bottom = 88.dp),
                            verticalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            items(activities, key = { it.id }) { activity ->
                                ActivityCard(
                                    activity = activity,
                                    onMarkDone = {
                                        viewModel.updateStatus(activity.id.toIntOrNull() ?: 0, "DONE")
                                    }
                                )
                            }
                        }
                    }
                }
            }
        }
    }

    if (showCreateDialog) {
        CreateActivityDialog(
            actionState = actionState,
            onDismiss = {
                showCreateDialog = false
                viewModel.resetActionState()
            },
            onSubmit = { viewModel.create(it) },
            searchClients = { q -> viewModel.searchClients(q) }
        )
    }
}

@Composable
private fun ActivityCard(activity: Activity, onMarkDone: () -> Unit) {
    val isDone = activity.status?.uppercase(Locale.US) in listOf("DONE", "COMPLETED")
    AccentCard(accentColor = activityTypeColor(activity.activityType)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Badge(text = activity.activityType ?: "—", color = activityTypeColor(activity.activityType))
                Spacer(Modifier.width(8.dp))
                Text(
                    text = activity.status?.uppercase(Locale.US) ?: "—",
                    style = MaterialTheme.typography.labelMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = if (isDone) SuccessGreen else WarningOrange
                )
            }
            Spacer(Modifier.height(4.dp))
            Text(
                text = formatDate(activity.activityDate) +
                    (activity.policyNo?.let { " · Policy $it" } ?: ""),
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            if (!activity.details.isNullOrBlank()) {
                Spacer(Modifier.height(4.dp))
                Text(
                    text = activity.details,
                    style = MaterialTheme.typography.bodyMedium
                )
            }
            if (!isDone) {
                Spacer(Modifier.height(4.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End
                ) {
                    Button(onClick = onMarkDone) {
                        Text("Mark Done")
                    }
                }
            }
    }
}

private val activityTypeOptions = listOf("CALL", "MEETING", "DEMO", "EMAIL", "PROPOSAL", "MEDICAL", "REMINDER")

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ActivityTypeDropdownField(
    value: String,
    onValueChange: (String) -> Unit,
    enabled: Boolean
) {
    var expanded by remember { mutableStateOf(false) }

    ExposedDropdownMenuBox(
        expanded = expanded,
        onExpandedChange = { if (enabled) expanded = it }
    ) {
        OutlinedTextField(
            value = value,
            onValueChange = {},
            readOnly = true,
            modifier = Modifier
                .fillMaxWidth()
                .menuAnchor(MenuAnchorType.PrimaryNotEditable),
            label = { Text("Type *") },
            singleLine = true,
            enabled = enabled,
            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) }
        )
        ExposedDropdownMenu(
            expanded = expanded,
            onDismissRequest = { expanded = false },
            modifier = Modifier.heightIn(max = 280.dp)
        ) {
            activityTypeOptions.forEach { option ->
                DropdownMenuItem(
                    text = { Text(option) },
                    onClick = {
                        onValueChange(option)
                        expanded = false
                    }
                )
            }
        }
    }
}

@Composable
private fun CreateActivityDialog(
    actionState: UiState<*>?,
    onDismiss: () -> Unit,
    onSubmit: (CreateActivityRequest) -> Unit,
    searchClients: suspend (String) -> List<com.balam.crm.data.model.Client>
) {
    var clientId by remember { mutableStateOf("") }
    var showClientPicker by remember { mutableStateOf(false) }
    var activityType by remember { mutableStateOf("") }
    var activityDate by remember { mutableStateOf("") }
    var details by remember { mutableStateOf("") }
    var policyNo by remember { mutableStateOf("") }
    val isLoading = actionState is UiState.Loading
    val errorMessage = (actionState as? UiState.Error)?.message

    AlertDialog(
        onDismissRequest = { if (!isLoading) onDismiss() },
        title = { Text("New Activity") },
        text = {
            Column(modifier = Modifier.verticalScroll(rememberScrollState()).imePadding()) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedTextField(
                        value = clientId,
                        onValueChange = { clientId = it },
                        modifier = Modifier.weight(1f),
                        label = { Text("Client ID *") },
                        singleLine = true,
                        enabled = !isLoading,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                    )
                    Spacer(Modifier.width(8.dp))
                    TextButton(onClick = { showClientPicker = true }, enabled = !isLoading) {
                        Text("Search")
                    }
                }
                Spacer(Modifier.height(8.dp))
                ActivityTypeDropdownField(
                    value = activityType,
                    onValueChange = { activityType = it },
                    enabled = !isLoading
                )
                Spacer(Modifier.height(8.dp))
                com.balam.crm.ui.components.DateField(
                    value = activityDate,
                    onValueChange = { activityDate = it },
                    label = "Date *",
                    enabled = !isLoading
                )
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = policyNo,
                    onValueChange = { policyNo = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Policy No (optional)") },
                    singleLine = true,
                    enabled = !isLoading,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                )
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = details,
                    onValueChange = { details = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Details (optional)") },
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
                        CreateActivityRequest(
                            clientId = clientId.trim().toIntOrNull() ?: 0,
                            activityType = activityType.trim().uppercase(Locale.US),
                            activityDate = activityDate.trim(),
                            policyNo = policyNo.trim().toIntOrNull(),
                            details = details.trim().takeIf { it.isNotBlank() }
                        )
                    )
                },
                enabled = clientId.trim().toIntOrNull() != null &&
                    activityType.isNotBlank() && activityDate.isNotBlank() && !isLoading
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

    if (showClientPicker) {
        com.balam.crm.ui.components.ClientPickerDialog(
            onDismiss = { showClientPicker = false },
            onSelected = { client ->
                clientId = client.id.toString()
                showClientPicker = false
            },
            searchClients = searchClients
        )
    }
}
