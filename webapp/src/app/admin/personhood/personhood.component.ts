import { Component, OnInit } from "@angular/core";
import Log from "@c4dt/cothority/log";
import { UserData } from "../../user-data.service";

@Component({
    selector: "app-personhood",
    styleUrls: ["./personhood.component.css"],
    templateUrl: "./personhood.component.html",
})
export class PersonhoodComponent {

    constructor(public uData: UserData) {
    }

}