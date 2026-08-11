package com.example.EcomSphere.MiddleWare

import com.example.EcomSphere.Helper.CustomUserPrincipal
import com.example.EcomSphere.Services.UserService.UserRepository
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
class JwtAuthFilter(
    private val jwtUtil: JwtUtil,
    private val userRepository: UserRepository
) : OncePerRequestFilter() {

    //This is used to one call every http request
    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        chain: FilterChain
    ) {
        val header = request.getHeader("Authorization")
        val token = header?.takeIf { it.startsWith("Bearer ") }?.removePrefix("Bearer ")

        if (token != null && SecurityContextHolder.getContext().authentication == null) {
            val email = jwtUtil.verifyAndGetEmail(token)
            if (email != null) {
                // Optional: verify the user still exists (or load roles)
                val userOpt = userRepository.findByEmail(email)
                if (userOpt.isPresent) {
                    // If you store roles, map them here; else give a default role
                    val authorities = listOf(SimpleGrantedAuthority("ROLE_USER"))

                    //Because userRepository.findByEmail(email) return Optional<User> so can not take the id or email directly there
                    val user = userOpt.get()

                    val principal = CustomUserPrincipal(
                        id = user.id!!,
                        email = user.email
                    )

                    // Creates and authentication object recognized by Spring Security
                    val auth = UsernamePasswordAuthenticationToken(
                        /* principal = */ principal,
                        /* credentials = */ null,
                        /* authorities = */ authorities
                    ).apply {
                        //Add request info (IP address, session ID,...)
                        details = WebAuthenticationDetailsSource().buildDetails(request)
                    }

                    SecurityContextHolder.getContext().authentication = auth
                }
            }
        }

        chain.doFilter(request, response)
    }

    // This function tells Spring which request doesn't need authentication. Here is the endpoint auth
    override fun shouldNotFilter(request: HttpServletRequest): Boolean {
        val path = request.servletPath
        val isPublic = path.startsWith("/auth/") || path == "/actuator/health" || path.startsWith("/docs")
        val isOptions = request.method.equals("OPTIONS", ignoreCase = true)
        return isPublic || isOptions
    }
}