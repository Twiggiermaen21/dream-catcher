package com.dreamcatcher.domain.user;

import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "users")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String displayName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    protected User() {}

    public User(String email, String password, String displayName, Role role) {
        this.email = email;
        this.password = password;
        this.displayName = displayName;
        this.role = role;
    }

    // UserDetails
    @Override public String getUsername()                                          { return email; }
    @Override public String getPassword()                                          { return password; }
    @Override public Collection<? extends GrantedAuthority> getAuthorities()      { return List.of(new SimpleGrantedAuthority("ROLE_" + role.name())); }
    @Override public boolean isAccountNonExpired()                                 { return true; }
    @Override public boolean isAccountNonLocked()                                  { return true; }
    @Override public boolean isCredentialsNonExpired()                             { return true; }
    @Override public boolean isEnabled()                                           { return true; }

    public UUID getId()          { return id; }
    public String getEmail()     { return email; }
    public String getDisplayName(){ return displayName; }
    public Role getRole()        { return role; }

    public void setEmail(String email)       { this.email = email; }
    public void setPassword(String password) { this.password = password; }
}
