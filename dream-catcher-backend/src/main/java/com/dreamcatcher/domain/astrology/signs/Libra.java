package com.dreamcatcher.domain.astrology.signs;

import com.dreamcatcher.domain.astrology.AirSign;

public final class Libra extends AirSign {
    public Libra() { super("Libra", "♎", 9, 23, 10, 22); }
    @Override public Modality getModality()    { return Modality.CARDINAL; }
    @Override public String getLuckyColor()    { return "Pink"; }
    @Override public String getRulingPlanet()  { return "Venus"; }
}
