package com.dreamcatcher.domain.astrology.signs;

import com.dreamcatcher.domain.astrology.EarthSign;

public final class Virgo extends EarthSign {
    public Virgo() { super("Virgo", "♍", 8, 23, 9, 22); }
    @Override public Modality getModality()    { return Modality.MUTABLE; }
    @Override public String getLuckyColor()    { return "Navy Blue"; }
    @Override public String getRulingPlanet()  { return "Mercury"; }
}
