<template>
    <v-dialog v-model="open">
        <template v-slot:activator="{ on }">
            <slot name="open" :on="on"></slot>
        </template>
        <v-card color="white">
            <v-card-text>
                <v-color-picker :value="color"></v-color-picker>
                <v-combobox v-model="selectedAlignment" :items="alignments"/>
                <v-checkbox v-model="showText" label="Text anzeigen"/>
            </v-card-text>
            <v-card-actions>
                <v-btn text @click="save">Ok</v-btn>
                <v-btn text @click="open = false">Abbrechen</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
  import { Component, Model, Vue, Watch } from 'vue-property-decorator';
  import FileAttr from "@/components/classes/FileAttr";

  @Component
  export default class ColorPickerDialog extends Vue {
    @Model()model: File;

    open: boolean = false;

    color: string = '';

    alignments: string [] = ['left', 'center', 'top', 'bottom', 'right'];

    selectedAlignment: string = '';

    showText: boolean = false;

    save(): void {
      const attrs :FileAttr = new FileAttr();

      attrs.align = this.selectedAlignment;

      attrs.color = this.color;
      attrs.showText = this.showText;

      this.$store.commit('ADD_FILES_ATTRS', {key: this.model, val: attrs});

      this.open = false;
    }

    @Watch('open')
    load() {
      if (this.open) {
        const attrs :FileAttr = this.$store.getters.filesConfig.get(this.model);

        if (attrs) {
          this.color = attrs.color;
          this.selectedAlignment = attrs.align;
          this.showText = attrs.showText;
        }
      }
    }
  }
</script>

<style scoped>

</style>
8
