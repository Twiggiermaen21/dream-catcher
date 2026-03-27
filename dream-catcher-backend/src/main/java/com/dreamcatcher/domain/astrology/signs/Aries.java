package com.dreamcatcher.domain.astrology.signs;

import com.dreamcatcher.domain.astrology.FireSign;

public final class Aries extends FireSign {
    public Aries() { super("Aries", "♈", 3, 21, 4, 19); }
    @Override public Modality getModality()    { return Modality.CARDINAL; }
    @Override public String getLuckyColor()    { return "Red"; }
    @Override public String getRulingPlanet()  { return "Mars"; }
}
