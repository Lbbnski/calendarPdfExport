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
                <v-file-input multiple chips label="Dateien" v-model="files">
                    <template v-slot:selection="{text, file}">
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
                                <v-list-item @click="showcolorPicker(file)">
                                    bearbeiten
                                </v-list-item>
                                <v-list-item @click="deleteFile(file)">
                                    löschen
                                </v-list-item>
                            </v-list>
                        </v-menu>
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
  import { Component, Vue } from "vue-property-decorator";
  import moment from 'moment-mini';
  import jsPDF from 'jspdf';
  import { readFileSync } from 'fs';
  import { Calendar, Parser } from 'ikalendar';

  @Component({})
  export default class Home extends Vue {

    // url: string = '';
    //
    year: number = moment(new Date).year();
    //
    width: number = 841.89;

    height: number = 595.28;

    relativeMarginSides: number = 0.02;

    relativeMarginTop: number = 0.03;

    files: File[] = [];

    snackbar: string = '';

    colorMap: Map<File, string> = new Map<File, string>();

    getColorForFile(file: File): string | undefined {
      return this.colorMap.get(file);
    }

    createPDF() {

      let doc: jsPDF = new jsPDF({
        orientation: 'landscape',
        format: 'a4',
        unit: 'pt'
      });

      this.createGeneralLayout(doc);

      doc.save('Kalender.pdf');
    }

    createGeneralLayout(document: jsPDF) {
      document.rect(this.width * this.relativeMarginSides, this.height * this.relativeMarginTop,
        this.width - (2 * (this.width * this.relativeMarginSides)), this.height - (2 * (this.height * this.relativeMarginTop)));
      for (let i: number = 1; i < 12; ++i) {
        const x = (this.width * this.relativeMarginSides) + (i * ((this.width - (2 * (this.width * this.relativeMarginSides))) / 12));
        document.line(x, this.height * this.relativeMarginTop,
          x, this.height - (this.height * this.relativeMarginTop));
      }
    }

    createCalendar(doc: jsPDF) {
      const parser: Parser = new Parser();
      this.files.forEach(value => {
        let fileContent: string = readFileSync(value, { encoding: 'utf8' });
        const cal: Calendar = parser.parse(fileContent);
        this.addCalendarContentToDoc(doc, cal);
      });
    }

    addCalendarContentToDoc(doc: jsPDF, cal: Calendar) {
      const start: Date = new Date(this.year, 0, 1);

      for (; start.getFullYear() === this.year; start.setDate(start.getDate() + 1)) {
        const x1 = (this.width * this.relativeMarginSides) + ((start.getMonth()) * ((this.width - (2 * (this.width * this.relativeMarginSides))) / 12));
        const x2 = (this.width * this.relativeMarginSides) + ((start.getMonth() + 1) * ((this.width - (2 * (this.width * this.relativeMarginSides))) / 12));
        const y = (((this.height - (2 * (this.height * this.relativeMarginTop))) / 31) * start.getDate());
        doc.line(x1, y, x2, y);
        if (cal.events) {
          cal.events.filter(value => {
            if (value.start) {
              return value.start.startsWith(`${ this.year }${ start.getDate() }${ start.getMonth() }`)
            }
            return false;
          }).forEach(value => {
            // TODO: handle Event
          });
        }
      }
    }
  }
</script>
