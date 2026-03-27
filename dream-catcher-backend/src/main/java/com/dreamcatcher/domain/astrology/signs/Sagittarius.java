package com.dreamcatcher.domain.astrology.signs;

import com.dreamcatcher.domain.astrology.FireSign;

public final class Sagittarius extends FireSign {
    public Sagittarius() { super("Sagittarius", "♐", 11, 22, 12, 21); }
    @Override public Modality getModality()    { return Modality.MUTABLE; }
    @Override public String getLuckyColor()    { return "Purple"; }
    @Override public String getRulingPlanet()  { return "Jupiter"; }
}
