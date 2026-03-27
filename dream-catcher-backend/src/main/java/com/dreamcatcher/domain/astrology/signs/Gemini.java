package com.dreamcatcher.domain.astrology.signs;

import com.dreamcatcher.domain.astrology.AirSign;

public final class Gemini extends AirSign {
    public Gemini() { super("Gemini", "♊", 5, 21, 6, 20); }
    @Override public Modality getModality()    { return Modality.MUTABLE; }
    @Override public String getLuckyColor()    { return "Yellow"; }
    @Override public String getRulingPlanet()  { return "Mercury"; }
}
