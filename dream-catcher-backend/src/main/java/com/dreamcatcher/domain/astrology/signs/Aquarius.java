package com.dreamcatcher.domain.astrology.signs;

import com.dreamcatcher.domain.astrology.AirSign;

public final class Aquarius extends AirSign {
    public Aquarius() { super("Aquarius", "♒", 1, 20, 2, 18); }
    @Override public Modality getModality()    { return Modality.FIXED; }
    @Override public String getLuckyColor()    { return "Electric Blue"; }
    @Override public String getRulingPlanet()  { return "Uranus"; }
}
