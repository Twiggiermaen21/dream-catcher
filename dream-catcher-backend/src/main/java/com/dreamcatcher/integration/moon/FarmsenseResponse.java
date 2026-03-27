package com.dreamcatcher.integration.moon;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class FarmsenseResponse {

    @JsonProperty("illumination")
    private double illumination;    // 0–100

    @JsonProperty("phase")
    private String phaseName;       // "Full Moon", "New Moon", etc.

    @JsonProperty("age")
    private double age;             // dni od nowego księżyca

    @JsonProperty("phase_index")
    private int phaseIndex;         // 0–7

    public double getIllumination() { return illumination; }
    public String getPhaseName()    { return phaseName; }
    public double getAge()          { return age; }
    public int getPhaseIndex()      { return phaseIndex; }
}
