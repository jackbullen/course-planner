import {
    IoMusicalNotesOutline, // MUSC
    IoStatsChartOutline, // STAT
    IoPlanetOutline, // ASTR
    // ...
} from 'react-icons/io5'
import {
    SlChemistry, // CHEM
} from "react-icons/sl"
import {
    GiPlanetCore, // GEO
    GiCatapult, // PHYS
    GiPencil, // ATWP
} from "react-icons/gi"
import {
    GrSystem, // SENG
} from "react-icons/gr"
import {
    RiEnglishInput, // ENGL
} from "react-icons/ri"
import {
    TfiThought, // PHIL
} from "react-icons/tfi"
import {
    BiMoviePlay, // THEA
} from "react-icons/bi"
import {
    FolderRegular,
    DocumentRegular,
    DocumentPdfRegular,
    EngineRegular, // Eng?
    LaptopRegular, // CSC
    MathFormatProfessionalRegular, // MATH
    EditRegular,
    DeleteRegular,
    // ...
} from "@fluentui/react-icons";
import { AvatarNamedColor } from '@fluentui/react-components'

export const getCourseIcon = (code: string): JSX.Element => {
    let icon = <FolderRegular />
    if (code.startsWith("MATH")) {
        icon = <MathFormatProfessionalRegular />
    } else if (code.startsWith("CSC")) {
        icon = <LaptopRegular />
    } else if (code.startsWith("STAT")) {
        icon = <IoStatsChartOutline />
    } else if (code.startsWith("ASTR")) {
        icon = <IoPlanetOutline />
    } else if (code.startsWith("PHYS")) {
        icon = <GiCatapult />
    } else if (code.startsWith("SENG")) {
        icon = <GrSystem />
    } else if (code.startsWith("ENGL")) {
        icon = <RiEnglishInput />
    } else if (code.startsWith("ATWP")) {
        icon = <GiPencil />
    } else if (code.startsWith("CHEM")) {
        icon = <SlChemistry />
    } else if (code.startsWith("GEOG")) {
        icon = <GiPlanetCore />
    } else if (code.startsWith("EOS")) {
        icon = <GiPlanetCore />
    } else if (code.startsWith("MUSC")) {
        icon = <IoMusicalNotesOutline />
    } else if (code.startsWith("PHIL")) {
        icon = <TfiThought />
    } else if (code.startsWith("THEA")) {
        icon = <BiMoviePlay />
    }
    return icon
}

export const getGradeColor = (grade: number): string => {
    let gradeColor: AvatarNamedColor = "pumpkin";
    if (grade > 95) {
        gradeColor = "light-teal";
    } else if (grade > 90) {
        gradeColor = "marigold";
    } else if (grade > 80) {
        gradeColor = "forest"
    } else if (grade > 70) {
        gradeColor = "beige";
    } else if (grade > 60) {
        gradeColor = "mink";
    } else {
        gradeColor = "red";
    }
    return gradeColor
}

export const gradeToLetter = (grade: number): string => {
    let letter = "N";
    if (grade >= 90) {
        letter = "A+";
    } else if (grade >= 85) {
        letter = "A";
    } else if (grade >= 80) {
        letter = "A-";
    } else if (grade >= 77) {
        letter = "B+";
    } else if (grade >= 73) {
        letter = "B";
    } else if (grade >= 70) {
        letter = "B-";
    } else if (grade >= 65) {
        letter = "C+";
    } else if (grade >= 60) {
        letter = "C";
    } else if (grade >= 50) {
        letter = "D";
    } else if (grade < 50){
        letter = "F";
    } 
    return letter;
}

export const gradeToPoint = (grade: number): number => {
    let point = 0;
    if (grade >= 90) {
        point = 9;
    } else if (grade >= 85) {
        point = 8;
    } else if (grade >= 80) {
        point = 7;
    } else if (grade >= 77) {
        point = 6;
    } else if (grade >= 73) {
        point = 5;
    } else if (grade >= 70) {
        point = 4;
    } else if (grade >= 65) {
        point = 3;
    } else if (grade >= 60) {
        point = 2;
    } else if (grade >= 50) {
        point = 1;
    } else if (grade < 50){
        point = 0;
    } 
    return point;
}