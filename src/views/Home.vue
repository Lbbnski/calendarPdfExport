<template>
  <v-card>
    <v-card-text>
      <v-row>
        <v-spacer></v-spacer>
        <v-text-field v-model="year" type="number" label="Jahr"></v-text-field>
        <v-spacer></v-spacer>
      </v-row>
      <v-row>
        <v-spacer></v-spacer>
        <v-file-input multiple accept=".ics" chips label="Dateien" v-model="files">
          <template v-slot:selection="{text, file}">
            <color-picker-dialog>
              <template v-slot:open="{ on }">
                <v-menu
                        bottom
                        offset-y
                        transition="slide-y-transition">
                  <template v-slot:activator="{ on }">
                    <v-chip @click.stop="{}" v-on="on" :color="getColorForFile(file)">
                      {{text}}
                    </v-chip>
                  </template>
                  <v-list>
                    <template>
                      <v-list-item v-on="on">
                        bearbeiten
                      </v-list-item>
                    </template>
                    <v-list-item @click="deleteFile(file)">
                      löschen
                    </v-list-item>
                  </v-list>
                </v-menu>
              </template>
            </color-picker-dialog>
          </template>
        </v-file-input>
        <v-spacer></v-spacer>
      </v-row>
      <v-row>
        <v-spacer></v-spacer>
        <v-btn @click="createPDF">Create PDF</v-btn>
        <v-spacer></v-spacer>
      </v-row>
    </v-card-text>
    <v-snackbar top value="snackbar">{{snackbar}}</v-snackbar>
  </v-card>
</template>

<script lang="ts">
import jsPDF from "jspdf";
import { Component, Vue } from "vue-property-decorator";
import moment from "moment-mini";
//import { readFileSync } from "fs";
import { Calendar, Parser, Event } from "ikalendar";
import ColorPickerDialog from "@/components/ColorPickerDialog.vue";

@Component({
  components: { ColorPickerDialog }
})
export default class Home extends Vue {
  // url: string = '';
  //
  year: number = moment(new Date()).year();

  width: number = 841.89;

  height: number = 595.28;

  relativeMarginSides: number = 0.02;

  relativeMarginTop: number = 0.03;

  files: File[] = [];

  snackbar: string = "";

  fileReader: FileReader = new FileReader();

  colorMap: Map<File, string> = new Map<File, string>();

  getColorForFile(file: File): string | undefined {
    return this.colorMap.get(file);
  }

  createPDF() {
    let doc: jsPDF = new jsPDF({
      orientation: "landscape",
      format: "a4",
      unit: "pt"
    });

    doc.setFontSize(8);

    this.createGeneralLayout(doc);

    this.createCalendar(doc);

    doc.save("Kalender.pdf");
  }

  createGeneralLayout(document: jsPDF) {
    document.rect(
      this.width * this.relativeMarginSides,
      this.height * this.relativeMarginTop,
      this.width - 2 * (this.width * this.relativeMarginSides),
      this.height - 2 * (this.height * this.relativeMarginTop)
    );
    for (let i: number = 1; i < 12; ++i) {
      const x =
        this.width * this.relativeMarginSides +
        i * ((this.width - 2 * (this.width * this.relativeMarginSides)) / 12);
      document.line(
        x,
        this.height * this.relativeMarginTop,
        x,
        this.height - this.height * this.relativeMarginTop
      );
    }
  }

  createCalendar(doc: jsPDF) {
    const parser: Parser = new Parser();
    const calArr: Calendar[] = [];
    this.files.forEach(value => {
      let fileContent: string = readFileSync(value, { encoding: 'utf8' });
      const cal: Calendar = parser.parse(fileContent);
      calArr.push(cal);
    });
    this.addCalendarContentToDoc(doc, calArr);
  }

  addCalendarContentToDoc(doc: jsPDF, calArr: Calendar[]) {
    const start: Date = new Date(this.year, 0, 1);

    for (
      ;
      start.getFullYear() === this.year;
      start.setDate(start.getDate() + 1)
    ) {
      const x1 =
        this.width * this.relativeMarginSides +
        start.getMonth() *
          ((this.width - 2 * (this.width * this.relativeMarginSides)) / 12);
      const x2 =
        this.width * this.relativeMarginSides +
        (start.getMonth() + 1) *
          ((this.width - 2 * (this.width * this.relativeMarginSides)) / 12);
      const y = this.cellHeight * start.getDate();
      if (start.getDate() !== 31) {
        doc.setLineWidth(1);
        doc.setDrawColor("#000000");
        doc.line(x1, y + this.cellHeight, x2, y + this.cellHeight);
      }

      doc.text(start.getDate() + "", x1 + 5, y + this.cellHeight / 2);

      doc.setLineWidth(10);
      doc.setDrawColor("#f003fc");

      calArr.forEach((cal: Calendar) => {
        if (cal.events) {
          cal.events
            .filter((value: Event) => {
              if (value.start) {
                return value.start.startsWith(
                  `${this.year}${start.getDate()}${start.getMonth()}`
                );
              }
              return false;
            })
            .forEach((value: Event) => {
              doc.line(x2 - 5, y, x2 - 5, y + this.cellHeight);
            });
        }
      });
    }
  }

  get cellHeight(): number {
    return (this.height - 2 * (this.height * this.relativeMarginTop)) / 31;
  }
}
</script>
