import { NotificationType } from "@/models/enums/NotificationType"
import type { Association, AssociationUpdate } from "@/models/interfaces/Association"
import { i18n } from "@/plugins/i18n"
import { AssociationDbService } from "@/services/associations/AssociationDbService"
import { addNotification } from "@/services/NotificationsService"
import { defineStore } from "pinia"
import { ref, type Ref } from "vue"
import { useRouter } from "vue-router"

export const useAssociationsStore = defineStore('associations', () => {
  const associationsList: Ref<Association[]> = ref([])
  const updateslist: Ref<AssociationUpdate[]> = ref([])
  const router = useRouter()
  const associationToEdit: Ref<Association | null> = ref(null)

  async function getAssociationsList() {
    try {
      const { associations, updates } = await AssociationDbService.getAssociations();
      associationsList.value = associations;
      updateslist.value = updates;
    } catch (error) {
      console.log('Error fetching associations:', error)
    }
  }

  function navigateToAssociation(associationId: string) {
    router.push({ name: 'association', params: { id: associationId } })
  }

  function activeAssociationEdition(id: string) {
    const updateSubmission = updateslist.value.find(association => association.association_id === id)
    if (updateSubmission) {
      associationToEdit.value = updateSubmission
    } else {
      const association = associationsList.value.find(association => association.id === id)
      if (association) {
        associationToEdit.value = association
      } else {
        addNotification(i18n.t('associations.associationNotFound'), NotificationType.ERROR)
      }
    }
  }

  async function submitUpdate(association: AssociationUpdate) {
    try {
      await AssociationDbService.submitAssociationUpdate(association)
      await getAssociationsList()
      associationToEdit.value = null
    } catch (error) {
      console.error(error)
    }
  }

  async function refuseUpdate(id: number, raiseResult: boolean = true) {
    try {
      await AssociationDbService.removeAssociationUpdate(id, raiseResult)
      associationToEdit.value = null
      await getAssociationsList()
    } catch (error) {
      console.error(error)
    }
  }

  async function validateUpdate(association: Association) {
    try {
      await AssociationDbService.validateAssociationUpdate(association)
      if (associationToEdit.value!.waiting_for_validation) {
        await refuseUpdate(associationToEdit.value!.id as unknown as number, false)
      }
      await getAssociationsList()
      associationToEdit.value = null
    } catch (error) {
      console.error(error)
    }
  }

  return { associationsList, associationToEdit, getAssociationsList, navigateToAssociation, activeAssociationEdition, submitUpdate, refuseUpdate, validateUpdate }
})
