<template>
  <div class="form-group mb-0">
    <label class="required">{{$t('editor.predator.actions.additional_specialization')}}:</label>
    <div style="width: 100%; display: flex; gap: 1rem; justify-content: center; align-items: center">
      <select v-model="selected" class="form-control" @change="onSelectionChange">
        <option v-for="(c, i) in data.choices" :key="i" :value="c">{{$t('data.skill.' + getSkillKey(c))}}</option>
      </select>
      <TipButton v-if="selected" :override="true" @click="skillInfoModal.showModal(getSkillKey(selected))"/>
    </div>
    <input class="form-control mt-10" v-if="selected.trim().length > 0" v-model="input" :placeholder="getPlaceholder(selected)" :disabled="!needsInput"/>

    <SkillInfoModal ref="skillInfoModal"/>
  </div>
</template>

<script lang="ts">
import {Component, Ref} from "vue-property-decorator";
import PTActionBase from "@/components/editor/actions/PTActionBase";
import {ICharacter, SkillKeys} from "@/types/models";
import SkillInfoModal from "@/components/editor/modals/SkillInfoModal.vue";
import TipButton from "@/components/editor/TipButton.vue";

@Component({
  components: {TipButton, SkillInfoModal}
})
export default class AdditionalSpecializationAction extends PTActionBase<{choices: string[]}> {

  @Ref("skillInfoModal")
  private skillInfoModal!: SkillInfoModal;

  private selected: string = "";
  private input: string = "";

  public applyOutput(char: ICharacter) {
    const skillKey = this.getSkillKey(this.selected);
    for (let i = 0; i < char.categories.length; i++) {
      const category = char.categories[i];
      const skill = category.skills.find(s => s.key === skillKey);
      if (skill) {
        skill.specialization.push(this.input);
        break;
      }
    }
  }

  public isReady(): boolean {
    return !!this.selected && (!this.needsInput || this.input.trim().length > 0);
  }

  private onSelectionChange() {
    this.input = "";
    if (!this.needsInput) {
      this.input = this.selected.split('=')[1];
    }
  }

  private get needsInput() {
    return this.selected.split('=')[1].startsWith("$input");
  }

  private getPlaceholder(choice: string) {
    const parts = choice.split('=')[1].split(':');
    return parts[1] ? parts[1] : "";
  }

  private getSkillKey(choice: string): SkillKeys {
    return <SkillKeys>choice.split('=')[0];
  }
}
</script>

<style scoped lang="scss">

</style>
