package com.balam.crm.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.balam.crm.data.model.Activity
import com.balam.crm.data.model.CreateActivityRequest
import com.balam.crm.ui.components.*
import com.balam.crm.ui.theme.Primary
import com.balam.crm.viewmodel.ActivitiesViewModel
import com.balam.crm.viewmodel.UiState

val ACTIVITY_STATUSES = listOf("PENDING", "DONE", "CANCELLED")
val ACTIVITY_TYPES = listOf("CALL", "VISIT", "FOLLOW_UP", "PAYMENT", "CLAIM", "OTHER")

@Composable
fun ActivitiesScreen(vm: ActivitiesViewModel = hiltViewModel()) {
    val activitiesState by vm.activities.collectAsStateWithLifecycle()
    val createState by vm.createState.collectAsStateWithLifecycle()
    var showCreateDialog by remember { mutableStateOf(false) }
    var updateActivity by remember { mutableStateOf<Activity?>(null) }
    var selectedStatus by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) { vm.load() }
    LaunchedEffect(createState) {
        if (createState is UiState.Success) {
            showCreateDialog = false
            updateActivity = null
            vm.resetCreateState()
            vm.load(status = selectedStatus)
        }
    }

    Scaffold(
        topBar = { CrmTopBar(title = "Activities") },
        floatingActionButton = {
            FloatingActionButton(onClick = { showCreateDialog = true }, containerColor = Primary) {
                Icon(Icons.Filled.Add, contentDescription = "Add", tint = Color.White)
            }
        }
    ) { padding ->
        Column(modifier = Modifier.fillMaxSize().padding(padding)) {
            // Status filter chips
            Row(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                FilterChip(selected = selectedStatus == null, onClick = { selectedStatus = null; vm.load() }, label = { Text("All") })
                ACTIVITY_STATUSES.forEach { status ->
                    FilterChip(
                        selected = selectedStatus == status,
                        onClick = { selectedStatus = status; vm.load(status = status) },
                        label = { Text(status) }
                    )
                }
            }

            when (val s = activitiesState) {
                is UiState.Loading, is UiState.Idle -> LoadingBox()
                is UiState.Error -> ErrorBox(s.message, onRetry = { vm.load() })
                is UiState.Success -> {
                    val list = s.data.data
                    if (list.isEmpty()) EmptyBox("No activities found")
                    else LazyColumn(
                        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(list) { activity ->
                            ActivityCard(
                                activity = activity,
                                onUpdateStatus = { updateActivity = activity }
                            )
                        }
                    }
                }
            }
        }
    }

    if (showCreateDialog) {
        CreateActivityDialog(
            isLoading = createState is UiState.Loading,
            error = (createState as? UiState.Error)?.message,
            onDismiss = { showCreateDialog = false; vm.resetCreateState() },
            onConfirm = { vm.createActivity(it) }
        )
    }

    updateActivity?.let { activity ->
        UpdateActivityStatusDialog(
            activity = activity,
            isLoading = createState is UiState.Loading,
            error = (createState as? UiState.Error)?.message,
            onDismiss = { updateActivity = null; vm.resetCreateState() },
            onConfirm = { status -> vm.updateActivity(activity.id.toInt(), status) }
        )
    }
}

@Composable
fun ActivityCard(activity: Activity, onUpdateStatus: () -> Unit) {
    Card(modifier = Modifier.fillMaxWidth(), elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(activity.activityType, fontWeight = FontWeight.SemiBold, style = MaterialTheme.typography.bodyLarge)
                    activity.policyNo?.let {
                        Text("Policy #$it", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
                Column(horizontalAlignment = Alignment.End) {
                    StatusBadge(activity.status)
                    Spacer(Modifier.height(4.dp))
                    TextButton(onClick = onUpdateStatus, contentPadding = PaddingValues(4.dp)) {
                        Text("Update", style = MaterialTheme.typography.labelSmall)
                    }
                }
            }
            activity.details?.let {
                Spacer(Modifier.height(4.dp))
                Text(it, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            Text(
                "Date: ${activity.activityDate}",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
fun CreateActivityDialog(
    isLoading: Boolean,
    error: String?,
    onDismiss: () -> Unit,
    onConfirm: (CreateActivityRequest) -> Unit
) {
    var policyNo by remember { mutableStateOf("") }
    var activityType by remember { mutableStateOf("CALL") }
    var details by remember { mutableStateOf("") }
    var activityDate by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Add Activity") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                OutlinedTextField(value = policyNo, onValueChange = { policyNo = it }, label = { Text("Policy No (optional)") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                Text("Type", style = MaterialTheme.typography.labelMedium)
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    ACTIVITY_TYPES.take(3).forEach { type ->
                        FilterChip(selected = activityType == type, onClick = { activityType = type }, label = { Text(type, style = MaterialTheme.typography.labelSmall) })
                    }
                }
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    ACTIVITY_TYPES.drop(3).forEach { type ->
                        FilterChip(selected = activityType == type, onClick = { activityType = type }, label = { Text(type, style = MaterialTheme.typography.labelSmall) })
                    }
                }
                OutlinedTextField(value = activityDate, onValueChange = { activityDate = it }, label = { Text("Activity Date (YYYY-MM-DD) *") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = details, onValueChange = { details = it }, label = { Text("Details") }, modifier = Modifier.fillMaxWidth(), maxLines = 3)
                error?.let { Text(it, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall) }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    onConfirm(CreateActivityRequest(
                        policyNo = policyNo.trim().toIntOrNull(),
                        activityType = activityType,
                        details = details.ifBlank { null },
                        activityDate = activityDate.trim()
                    ))
                },
                enabled = activityDate.isNotBlank() && !isLoading
            ) {
                if (isLoading) CircularProgressIndicator(Modifier.size(16.dp), strokeWidth = 2.dp)
                else Text("Add")
            }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } }
    )
}

@Composable
fun UpdateActivityStatusDialog(
    activity: Activity,
    isLoading: Boolean,
    error: String?,
    onDismiss: () -> Unit,
    onConfirm: (String) -> Unit
) {
    var selectedStatus by remember { mutableStateOf(activity.status) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Update Status") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text("${activity.activityType} • ${activity.activityDate}", style = MaterialTheme.typography.bodyMedium)
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    ACTIVITY_STATUSES.forEach { status ->
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            RadioButton(selected = selectedStatus == status, onClick = { selectedStatus = status })
                            Text(status, style = MaterialTheme.typography.bodyMedium)
                        }
                    }
                }
                error?.let { Text(it, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall) }
            }
        },
        confirmButton = {
            Button(onClick = { onConfirm(selectedStatus) }, enabled = !isLoading) {
                if (isLoading) CircularProgressIndicator(Modifier.size(16.dp), strokeWidth = 2.dp)
                else Text("Update")
            }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } }
    )
}
