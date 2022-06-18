<template>
  <Modal :shown="show" @close="show = false">
    <div style="display: flex; flex-direction: column; gap: 1rem; width: 20rem" v-if="data">
      <b>{{$t('viewer.modal.level.attribute')}}:</b>
      <div style="width: 100%; text-align: center">{{data.value}} &#8594; {{data.value + 1}} <bullet/> {{$t('viewer.modal.level.costs', {xp: neededExp})}}</div>
      <div style="width: 100%; display: flex; justify-content: center; align-items: center">
        <button class="btn btn-primary" :disabled="neededExp > editingCharacter.exp" @click="level">{{$t('viewer.modal.level.btn')}}</button>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import Modal from "@/components/modal/Modal.vue";
import {State} from "vuex-class";
import {IAttributeData, ICharacter} from "@/types/models";
import {levelResolver} from "@/libs/resolvers/level-resolver";
import Bullet from "@/components/Bullet.vue";
import CharacterStorage from "@/libs/io/character-storage";

@Component({
  components: {Bullet, Modal}
})
export default class AttributeModal extends Vue {

  @State("editingCharacter")
  private editingCharacter!: ICharacter;

  private show: boolean = false;
  private data: IAttributeData = null!;

  public showModal(data: IAttributeData) {
    this.data = data;
    this.show = true;
  }

  private level() {
    if (this.editingCharacter.exp < this.neededExp) {
      return;
    }

    this.editingCharacter.exp -= this.neededExp;
    this.data.value++;
    CharacterStorage.saveCharacter(this.editingCharacter);
    this.show = false;
  }

  private get neededExp(): number {
    return levelResolver.resolveAttribute(this.editingCharacter, this.data.key);
  }
}
</script>

<style scoped lang="scss">

</style>