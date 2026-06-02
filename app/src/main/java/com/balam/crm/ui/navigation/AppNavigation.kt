package com.balam.crm.ui.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.*
import androidx.navigation.navArgument
import com.balam.crm.data.api.TokenStore
import com.balam.crm.ui.screens.*

sealed class Screen(val route: String) {
    object Login : Screen("login")
    object Register : Screen("register")
    object Dashboard : Screen("dashboard")
    object Policies : Screen("policies")
    object PolicyDetail : Screen("policy/{policyNo}") // policyNo is Int
    object FUP : Screen("fup")
    object Families : Screen("families")
    object FamilyDetail : Screen("family/{familyCode}")
    object Clients : Screen("clients")
    object ClientDetail : Screen("client/{id}")
    object Commission : Screen("commission")
    object Loans : Screen("loans")
    object SB : Screen("sb")
    object Leads : Screen("leads")
    object Activities : Screen("activities")
    object GST : Screen("gst")
    object Reports : Screen("reports")
    object Profile : Screen("profile")
    object More : Screen("more")

    fun withArgs(vararg args: String): String {
        var result = route
        args.forEach { arg ->
            result = result.replaceFirst(Regex("\\{[^}]+}"), arg)
        }
        return result
    }
}

data class BottomNavItem(val screen: Screen, val label: String, val icon: ImageVector)

val bottomNavItems = listOf(
    BottomNavItem(Screen.Dashboard, "Dashboard", Icons.Filled.Dashboard),
    BottomNavItem(Screen.Policies, "Policies", Icons.Filled.Policy),
    BottomNavItem(Screen.FUP, "FUP", Icons.Filled.Alarm),
    BottomNavItem(Screen.Families, "Families", Icons.Filled.FamilyRestroom),
    BottomNavItem(Screen.More, "More", Icons.Filled.MoreHoriz)
)

@Composable
fun AppNavigation(tokenStore: TokenStore) {
    val navController = rememberNavController()
    val startDestination = remember { if (tokenStore.isLoggedIn()) Screen.Dashboard.route else Screen.Login.route }

    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    val showBottomBar = currentRoute in bottomNavItems.map { it.screen.route }

    Scaffold(
        bottomBar = {
            if (showBottomBar) {
                NavigationBar {
                    bottomNavItems.forEach { item ->
                        NavigationBarItem(
                            icon = { Icon(item.icon, contentDescription = item.label) },
                            label = { Text(item.label) },
                            selected = currentRoute == item.screen.route,
                            onClick = {
                                navController.navigate(item.screen.route) {
                                    popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            }
                        )
                    }
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = startDestination,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Screen.Login.route) {
                LoginScreen(
                    onLoginSuccess = {
                        navController.navigate(Screen.Dashboard.route) {
                            popUpTo(Screen.Login.route) { inclusive = true }
                        }
                    },
                    onNavigateToRegister = { navController.navigate(Screen.Register.route) }
                )
            }
            composable(Screen.Register.route) {
                RegisterScreen(
                    onRegisterSuccess = { navController.popBackStack() },
                    onNavigateToLogin = { navController.popBackStack() }
                )
            }
            composable(Screen.Dashboard.route) {
                DashboardScreen(navController = navController)
            }
            composable(Screen.Policies.route) {
                PoliciesScreen(
                    onPolicyClick = { policyNo ->
                        navController.navigate(Screen.PolicyDetail.withArgs(policyNo.toString()))
                    }
                )
            }
            composable(
                Screen.PolicyDetail.route,
                arguments = listOf(navArgument("policyNo") { type = NavType.IntType })
            ) { backStackEntry ->
                val policyNo = backStackEntry.arguments?.getInt("policyNo") ?: 0
                PolicyDetailScreen(policyNo = policyNo, onBack = { navController.popBackStack() })
            }
            composable(Screen.FUP.route) {
                FUPScreen()
            }
            composable(Screen.Families.route) {
                FamiliesScreen(
                    onFamilyClick = { familyCode ->
                        navController.navigate(Screen.FamilyDetail.withArgs(familyCode))
                    }
                )
            }
            composable(
                Screen.FamilyDetail.route,
                arguments = listOf(navArgument("familyCode") { type = NavType.StringType })
            ) { backStackEntry ->
                val familyCode = backStackEntry.arguments?.getString("familyCode") ?: ""
                FamilyDetailScreen(
                    familyCode = familyCode,
                    onBack = { navController.popBackStack() },
                    onClientClick = { id -> navController.navigate(Screen.ClientDetail.withArgs(id.toString())) },
                    onPolicyClick = { policyNo -> navController.navigate(Screen.PolicyDetail.withArgs(policyNo.toString())) }
                )
            }
            composable(Screen.Clients.route) {
                ClientsScreen(
                    onClientClick = { id -> navController.navigate(Screen.ClientDetail.withArgs(id.toString())) }
                )
            }
            composable(
                Screen.ClientDetail.route,
                arguments = listOf(navArgument("id") { type = NavType.IntType })
            ) { backStackEntry ->
                val id = backStackEntry.arguments?.getInt("id") ?: 0
                ClientDetailScreen(id = id, onBack = { navController.popBackStack() })
            }
            composable(Screen.Commission.route) {
                CommissionScreen()
            }
            composable(Screen.Loans.route) {
                LoansScreen()
            }
            composable(Screen.SB.route) {
                SBScreen()
            }
            composable(Screen.Leads.route) {
                LeadsScreen()
            }
            composable(Screen.Activities.route) {
                ActivitiesScreen()
            }
            composable(Screen.GST.route) {
                GSTScreen()
            }
            composable(Screen.Reports.route) {
                ReportsScreen()
            }
            composable(Screen.Profile.route) {
                ProfileScreen(
                    onLogout = {
                        tokenStore.clear()
                        navController.navigate(Screen.Login.route) {
                            popUpTo(0) { inclusive = true }
                        }
                    }
                )
            }
            composable(Screen.More.route) {
                MoreScreen(navController = navController)
            }
        }
    }
}
