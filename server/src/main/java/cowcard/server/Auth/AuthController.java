package cowcard.server.Auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cowcard.server.Auth.dto.LoginRequest;
import cowcard.server.Auth.dto.RegisterRequest;
import cowcard.server.Auth.dto.WhoAmI;
import cowcard.server.Common.ServerRes;
import cowcard.server.User.User;
import cowcard.server.User.UserDetail;
import cowcard.server.User.UserRepository;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

import org.springframework.http.ResponseCookie;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
public class AuthController {

	private final AuthenticationManager authenticationManager;
	private final JwtService jwtService;
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	@Value("${jwt.expiration}")
	private long jwtExpiration;

	public AuthController(AuthenticationManager authenticationManager, JwtService jwtService,
			UserRepository userRepository, PasswordEncoder passwordEncoder) {
		this.authenticationManager = authenticationManager;
		this.jwtService = jwtService;
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@PostMapping("/register")
	public ServerRes<String> register(@Valid @RequestBody RegisterRequest request) {
		if (userRepository.findByEmail(request.getEmail()).isPresent()) {
			return ServerRes.error("Email already exists");
		}
		if (userRepository.findByPhone(request.getPhone()).isPresent()) {
			return ServerRes.error("Phone number already exists");
		}

		User user = new User();
		user.setId(UUID.randomUUID());
		user.setName(request.getName());
		user.setEmail(request.getEmail());
		user.setPhone(request.getPhone());
		user.setPassword(passwordEncoder.encode(request.getPassword()));
		user.setApproved(false);
		user.setActive(true);
		user.setCreatedAt(LocalDateTime.now());
		userRepository.save(user);

		return ServerRes.success("Registration successful");
	}

	@PostMapping("/login")
	public ServerRes<String> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
		authenticationManager.authenticate(
				new UsernamePasswordAuthenticationToken(request.getIdentifier(),
						request.getPassword()));

		User user = userRepository.findByEmail(request.getIdentifier())
				.or(() -> userRepository.findByPhone(request.getIdentifier()))
				.orElseThrow();

		String token = jwtService.generateAccessToken(user.getEmail());

		ResponseCookie jwtCookie = ResponseCookie.from("jwt", token)
				.httpOnly(true)
				.secure(false)
				.path("/")
				.maxAge(jwtExpiration / 1000)
				.sameSite("Lax")
				.build();

		response.addHeader("Set-Cookie", jwtCookie.toString());
		user.setLastLogin(LocalDateTime.now());
		userRepository.save(user);
		return ServerRes.success("Login successful");
	}

	@PostMapping("/logout")
	public ServerRes<String> logout(HttpServletResponse response) {
		ResponseCookie jwtCookie = ResponseCookie.from("jwt", "")
				.httpOnly(true)
				.secure(false)
				.path("/")
				.maxAge(0)
				.sameSite("Lax")
				.build();

		response.addHeader("Set-Cookie", jwtCookie.toString());

		return ServerRes.success("Logged out successfully");
	}

	@GetMapping("/whoami")
	public ServerRes<WhoAmI> whoAmI() {
		var auth = SecurityContextHolder.getContext().getAuthentication();

		if (auth != null && auth.getPrincipal() instanceof UserDetail userDetail) {
			return ServerRes.success(new WhoAmI(userDetail.getId(), userDetail.getUsername(),
					userDetail.getName(), userDetail.isAdmin()));
		}

		return ServerRes.<WhoAmI>error("Unauthorized");
	}
}
