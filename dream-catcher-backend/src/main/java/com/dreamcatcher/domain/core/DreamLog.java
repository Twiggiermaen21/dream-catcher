package com.dreamcatcher.domain.core;

import com.dreamcatcher.domain.context.EnvironmentalContext;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "dream_logs")
public final class DreamLog extends LogEntry {

    public enum DreamClarity   { VIVID, NORMAL, BLURRY, FORGOTTEN }
    public enum DreamSentiment { POSITIVE, NEUTRAL, NEGATIVE, MIXED }

    @Column(nullable = false, length = 3000)
    private String dreamDescription;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DreamClarity clarity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DreamSentiment sentiment;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "dream_log_symbols", joinColumns = @JoinColumn(name = "dream_log_id"))
    @Column(name = "symbol")
    private List<String> symbols;    // np. "woda", "latanie", "dom", "pościg"

    private boolean isRecurring;     // sen powracający

    protected DreamLog() {}

    public DreamLog(UUID userId, LocalDate date, EnvironmentalContext context,
                    String dreamDescription, DreamClarity clarity,
                    DreamSentiment sentiment, List<String> symbols, boolean isRecurring) {
        super(userId, date, context);
        this.dreamDescription = Objects.requireNonNull(dreamDescription, "dreamDescription cannot be null");
        this.clarity   = Objects.requireNonNull(clarity,   "clarity cannot be null");
        this.sentiment = Objects.requireNonNull(sentiment, "sentiment cannot be null");
        this.symbols   = symbols != null ? List.copyOf(symbols) : List.of();
        this.isRecurring = isRecurring;
    }

    @Override
    public int calculateWellnessScore() {
        int base = switch (sentiment) {
            case POSITIVE -> 80;
            case NEUTRAL  -> 60;
            case MIXED    -> 45;
            case NEGATIVE -> 25;
        };

        // Wyraźność snu jako bonus
        if (clarity == DreamClarity.VIVID)    base += 10;
        if (clarity == DreamClarity.FORGOTTEN) base -= 15;

        // Pełnia księżyca = żywsze, intensywniejsze sny
        if (isFullMoon()) base += 8;

        // Sny powracające mogą sugerować nierozwiązane napięcia
        if (isRecurring && sentiment == DreamSentiment.NEGATIVE) base -= 10;

        return Math.max(0, Math.min(100, base));
    }

    public boolean isLucid() {
        // Marker dla snów świadomych (symbol "lucid" dodany przez użytkownika)
        return symbols.contains("lucid");
    }

    public String getDreamDescription() { return dreamDescription; }
    public DreamClarity getClarity()    { return clarity; }
    public DreamSentiment getSentiment(){ return sentiment; }
    public List<String> getSymbols()    { return symbols; }
    public boolean isRecurring()        { return isRecurring; }
}
