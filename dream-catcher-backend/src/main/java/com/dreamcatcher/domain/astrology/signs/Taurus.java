package com.dreamcatcher.domain.astrology.signs;

import com.dreamcatcher.domain.astrology.EarthSign;

public final class Taurus extends EarthSign {
    public Taurus() { super("Taurus", "♉", 4, 20, 5, 20); }
    @Override public Modality getModality()    { return Modality.FIXED; }
    @Override public String getLuckyColor()    { return "Green"; }
    @Override public String getRulingPlanet()  { return "Venus"; }
}
